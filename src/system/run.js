import { _, async, config} from 'azk';
import docker from 'azk/docker';
import { ImageNotAvailable, SystemRunError } from 'azk/utils/errors';
import net from 'azk/utils/net';

var Run = {
  runShell(system, command, options = {}) {
    return this.checkImage(system, options).then((image) => {
      options = system.shellOptions(options);
      return docker.run(system.image.name, command, options);
    });
  },

  runDaemon(system, options = {}) {
    return async(this, function* (notify) {
      // TODO: add instances and dependencies options
      // Prepare options
      var image = yield this.checkImage(system, options);
      options.image_data = image;

      var docker_opt = system.daemonOptions(options);
      var command    = docker_opt.command;
      var container  = yield docker.run(system.image.name, command, docker_opt);

      var data = yield container.inspect();
      var port_data = _.find(data.NetworkSettings.Access);

      if (port_data) {
        if (config('agent:requires_vm')) {
          var host = config('agent:vm:ip');
        } else {
          var host = port.gateway;
        }

        // Wait for available
        var retry   = options.timeout || config('docker:run:retry');
        var timeout = options.retry   || config('docker:run:timeout');
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
          data = yield container.inspect();
          var log = yield container.logs({stdout: true, stderr: true});
          throw new SystemRunError(
            system.name,
            container,
            data.Config.Cmd.join(' '),
            data.State.ExitCode,
            log
          );
        }
      }

      return container;
    });
  },

  stop(system, instances, kill = false) {
    return async(function* (notify) {
      var container = null;
      while (container = instances.pop()) {
        container = docker.getContainer(container.Id);
        if (kill) {
          notify({ type: 'kill_service', system: system.name });
          yield container.kill();
        } else {
          notify({ type: 'stop_service', system: system.name });
          yield container.stop();
        }
        notify({ type: "stopped", id: container.Id });
        return container.remove();
      }
    });
  },

  // Check and pull image
  checkImage(system, options) {
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
}

export { Run }
