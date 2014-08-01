import { _, async, config} from 'azk';
import docker from 'azk/docker';
import { ImageNotAvailable, SystemRunError, RunCommandError } from 'azk/utils/errors';
import net from 'azk/utils/net';
import { Balancer } from 'azk/system/balancer';

var MemoryStream = require('memorystream');

var Run = {

  runProvision(system, options = {}) {
    return async(this, function* (notify) {
      var steps = system.provision_steps;

      options = _.defaults(options, {
        provision_force: false,
      });

      if (_.isEmpty(steps)) return null;
      if ((!options.provision_force) && system.provisioned) return null;

      // provision command (require /bin/sh)
      var cmd  = ["/bin/sh", "-c", "( " + steps.join('; ') + " )"];

      // Capture outputs
      var output = "";
      options = _.clone(options);
      options.shell_type = "provision";
      options.stdout = new MemoryStream();
      options.stdout.on('data', (data) => {
        output += data.toString();
      });

      notify({ type: "provision", system: system.name });
      var exitResult = yield system.runShell(cmd, options);
      if (exitResult.code != 0) {
        throw new RunCommandError(cmd.join(' '), output);
      }
      // save the date provisioning
      system.provisioned = new Date();
    });
  },

  runShell(system, command, options = {}) {
    return async(this, function* () {
      options = _.defaults(options, {
        remove: false,
        sequencies: yield this._getSequencies(system)
      });

      yield this._check_image(system, options);
      var docker_opt = system.shellOptions(options);

      var container  = yield docker.run(system.image.name, command, docker_opt);
      var data       = yield container.inspect();

      // Remove before run
      if (options.remove) { yield container.remove(); }

      return {
        code: data.State.ExitCode,
        containerId: container.Id,
        removed: options.remove,
      }
    });
  },

  runDaemon(system, options = {}) {
    return async(this, function* (notify) {
      // TODO: add instances and dependencies options
      // Prepare options
      var image = yield this._check_image(system, options);
      options.image_data = image;

      // Check provision
      yield system.runProvision(options);

      options = _.defaults(options, {
        sequencies: yield this._getSequencies(system),
        wait: true,
      });

      var docker_opt = system.daemonOptions(options);
      var command    = docker_opt.command;
      var container  = yield docker.run(system.image.name, command, docker_opt);

      if (options.wait) {
        // TODO: support to wait udp protocol
        var data = yield container.inspect();
        var port_data = _.chain(data.NetworkSettings.Access)
          .filter((port) => {
            return port.protocol == 'tcp'
          })
          .find()
          .value();

        if (!_.isEmpty(port_data)) {
          var retry   = options.timeout || config('docker:run:retry');
          var timeout = options.retry   || config('docker:run:timeout');

          yield this._wait_available(system, port_data, container, retry, timeout);
        }

        // Adding to balancer
        yield Balancer.add(system, container);
      }

      return container;
    });
  },

  stop(system, instances, options = {}) {
    options = _.defaults(options, {
      kill: false,
      remove: true,
    });

    return async(function* (notify) {
      var container = null;

      // Default stop all
      if (_.isEmpty(instances)) {
        instances = yield system.instances();
      }

      while (container = instances.pop()) {
        container = docker.getContainer(container.Id);

        // Remove from balancer
        yield Balancer.remove(system, container);

        if (options.kill) {
          notify({ type: 'kill_service', system: system.name });
          yield container.kill();
        } else {
          notify({ type: 'stop_service', system: system.name });
          yield container.stop();
        }
        notify({ type: "stopped", id: container.Id });
        if (options.remove)
          yield container.remove();
      }

      return true;
    });
  },

  // Wait for container/system available
  _wait_available(system, port_data, container, retry, timeout) {
    return async(this, function* () {
      if (config('agent:requires_vm')) {
        var host = config('agent:vm:ip');
      } else {
        var host = port_data.gateway;
      }

      // Wait for available
      var wait_opts = {
        timeout: timeout,
        retry_if: () => {
          return container.inspect().then((data) => {
            return data.State.Running;
          });
        },
      };

      var running = yield net.waitService(host, port_data.port, retry, wait_opts);

      if (!running) {
        var data = yield container.inspect();
        var log  = yield container.logs({stdout: true, stderr: true});
        yield this.stop(system, [container], { kill: true, remove: true });
        throw new SystemRunError(
          system.name,
          container,
          data.Config.Cmd.join(' '),
          data.State.ExitCode,
          log
        );
      }

      return true;
    });
  },

  // Check and pull image
  _check_image(system, options) {
    options = _.defaults(options, {
      image_pull: true,
    });

    return async(function* () {
      if (options.image_pull) {
        var promise = system.image.pull();
      } else {
        var promise = system.image.check().then((image) => {
          if (image == null) {
            throw new ImageNotAvailable(system.name, system.image.name);
          }
          return image;
        });
      }

      var image = yield promise.progress((event) => {
        event.system = system;
        return event;
      });

      return image.inspect();
    });
  },

  _getSequencies(system, type = "*") {
    return async(this, function*() {
      var instances = yield system.instances({ type: type });

      return _.reduce(instances, (sequencies, instance) => {
        var type = instance.Annotations.azk.type;
        var seq  = parseInt(instance.Annotations.azk.seq);
        if (seq === sequencies[type]) {
          sequencies[type] = sequencies[type] + 1;
        }
        return sequencies;
      }, { shell: 1, daemon: 1 });
    });
  },

  instances(system, options = {}) {
    // Default options
    options = _.defaults(options, {
      include_dead: false,
      include_exec: false,
      type: "*",
    });

    // Include dead containers
    var query_options = {};
    if (options.include_dead) query_options.all = true ;

    return docker.azkListContainers(query_options).then((containers) => {
      var instances = _.filter(containers, (container) => {
        var azk = container.Annotations.azk;
        return (
          azk.mid == system.manifest.namespace &&
          azk.sys == system.name &&
          ( options.type == "*" || azk.type == options.type )
        )
      });

      return _.sortBy(instances, (instance) => { return instance.Annotations.azk.seq });
    });
  },
}

export { Run }
