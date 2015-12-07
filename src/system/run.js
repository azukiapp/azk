import { _, t, lazy_require, isBlank } from 'azk';
import { config, log, path } from 'azk';
import { subscribe, publish } from 'azk/utils/postal';
import { defer, async, asyncUnsubscribe, promiseResolve, thenAll } from 'azk/utils/promises';
import { ImageNotAvailable, SystemRunError, RunCommandError, NotBeenImplementedError } from 'azk/utils/errors';
import { Balancer } from 'azk/system/balancer';
import net from 'azk/utils/net';

var lazy = lazy_require({
  MemoryStream: 'memorystream',
  docker      : ['azk/docker', 'default'],
  Client      : ['azk/agent/client'],
});

var Run = {
  runProvision(system, options = {}) {
    return async(this, function* () {
      var steps = system.provision_steps;

      options = _.clone(options);
      options = _.defaults(options, {
        provision_force: false,
        build_force: false,
        provision_verbose: false,
      });

      if (_.isEmpty(steps)) {
        return null;
      }
      if ((!options.provision_force) && system.provisioned) {
        return null;
      }
      log.debug('provision steps', steps);

      // provision command (require /bin/sh)
      options.command = "(" + steps.join(' && ') + ")";

      // Capture outputs
      var output = "";
      if (!options.provision_verbose) {
        options = _.clone(options);
        options.shell_type = "provision";
        options.stdout = new lazy.MemoryStream();
        options.stderr = options.stdout;
        options.stdout.on('data', (data) => {
          output += data.toString();
        });
        options.silent_sync = true;
      } else {
        output = t("system.seelog");
      }

      publish("system.run.provision.status", { type: "provision", system: system.name });
      var exitResult = yield system.runShell(options);
      if (exitResult.code !== 0) {
        var command = system.printableCommand(exitResult.containerData, exitResult.imageConf);
        throw new RunCommandError(system.name, command, output);
      }
      // save the date provisioning
      system.provisioned = new Date();
    });
  },

  runShell(system, options = {}) {
    return async(this, function* () {
      options = _.defaults(options, {
        remove: false,
        sequencies: yield this._getSequencies(system)
      });

      // Sync folders if set in mounts section at Azkfile.js
      yield system.runWatch(false, options.silent_sync);

      // Envs
      var deps_envs = yield system.checkDependsAndReturnEnvs(options, false);
      options.envs  = _.merge(deps_envs, options.envs || {});

      var image = yield this._check_image(system, options);
      var docker_opt = system.shellOptions(options, image.Config);

      // Force env TERM in interatives shells (like a ssh)
      if (_.isObject(docker_opt.env) && options.interactive && !docker_opt.env.TERM) {
        docker_opt.env.TERM = options.shell_term;
      }

      var container = yield lazy.docker.run(system.image.name, docker_opt.command, docker_opt);
      var data      = yield container.inspect();

      log.debug("[system] container shell ended: %s", container.id);

      // Remove after run
      if (options.remove) {
        log.debug("[system] call to remove container %s", container.id);
        yield container.remove();
        log.debug("[system] container removed %s", container.id);
      }

      yield system.stopWatching();

      return {
        code: data.State.ExitCode,
        container: container,
        containerData: data,
        containerId: container.Id,
        imageConf: image.Config,
        removed: options.remove,
      };
    });
  },

  runDaemon(system, options = {}) {
    return async(this, function* () {
      // TODO: add instances and dependencies options

      // Prepare options
      var image = yield this._check_image(system, options);
      options.image_data = image;

      // Check provision
      yield system.runProvision(options);

      // Sync folders if set in mounts section at Azkfile.js
      yield system.runWatch(true);

      options = _.defaults(options, {
        sequencies: yield this._getSequencies(system),
        wait: system.wait_scale,
      });

      var docker_opt = system.daemonOptions(options, image.Config);
      var container  = yield lazy.docker.run(system.image.name, docker_opt.command, docker_opt);

      if (options.wait) {
        var first_tcp = _.find((docker_opt.ports_orderly || []), (data) => {
          return /\/tcp/.test(data.name);
        });

        // TODO: support to wait udp protocol
        var data = yield container.inspect();
        var port_data = _.chain(data.NetworkSettings.Access)
          .filter((port) => {
            return port.protocol == 'tcp' && port.name == first_tcp.private;
          })
          .find()
          .value();

        if (!_.isEmpty(port_data)) {
          var timeout = options.wait.timeout || config('docker:run:timeout');
          yield this._wait_available(system, port_data, container, timeout, options, image.Config);
        }
      }

      // Adding to balancer
      yield Balancer.add(system, container);

      return container;
    });
  },

  runWatch(system, daemon = true, silent = false) {
    var topic = "system.sync.status";
    if (_.isEmpty(system.syncs)) {
      return true;
    }

    if (!silent) {
      publish(topic, { type : "sync", system : system.name });
    }

    return thenAll(_.map(system.syncs || {}, (sync_data, host_folder) => {
      return async(this, function* () {
        if (daemon && sync_data.options.daemon === false ||
           !daemon && sync_data.options.shell !== true) {
          return promiseResolve();
        }

        if (config('agent:requires_vm')) {
          sync_data.options = _.defaults(sync_data.options, { use_vm: true, ssh: lazy.Client.ssh_opts() });
        }

        var clean_sync_folder = yield this._clean_sync_folder(system, host_folder);
        if (clean_sync_folder !== 0) {
          // TODO: throw proper error
          throw new NotBeenImplementedError('SyncError');
        }

        var pub_data = {
          system      : system.name,
          host_folder : host_folder,
          guest_folder: sync_data.guest_folder,
          options     : sync_data.options
        };

        publish(topic, _.merge({ type : "sync_start" }, pub_data));

        return lazy.Client
          .watch(host_folder, sync_data.guest_folder, sync_data.options)
          .then(() => {
            publish(topic, _.merge({ type : "sync_done" }, pub_data));
          });
      });
    }));
  },

  stopWatching(system) {
    return thenAll(_.map(system.syncs || {}, (sync_data, host_folder) => {
      return lazy.Client.unwatch(path.join(host_folder, '/'), sync_data.guest_folder)
        .then(() => {
          publish("system.sync.status", {
            type        : "unwatch",
            system      : system.name,
            host_folder : host_folder,
            guest_folder: sync_data.guest_folder
          });
        });
    }));
  },

  stop(system, instances, options = {}) {
    options = _.defaults(options, {
      kill: false,
      remove: true,
    });

    return async(function* () {
      var container = null;

      // Default stop all
      if (_.isEmpty(instances)) {
        instances = yield system.instances();
      }

      while ( (container = instances.pop()) ) {
        container = lazy.docker.getContainer(container.Id);

        var container_info = yield container.inspect();

        // Remove from balancer
        yield Balancer.remove(system, container);

        if (container_info.State.Running) {
          if (options.kill) {
            publish("system.run.stop.status", { type: 'kill_service', system: system.name });
            yield container.kill();
          } else {
            publish("system.run.stop.status", { type: 'stop_service', system: system.name });
            yield container.stop();
          }
        }

        publish("system.run.stop.status", { type: 'stopped', id: container.Id });
        if (options.remove) {
          yield container.remove();
        }

        yield system.stopWatching();
      }

      return true;
    });
  },

  // Wait for container/system available
  _wait_available(system, port_data, container, timeout, options, image_conf) {
    return async(this, function* () {
      var host;
      if (config('agent:requires_vm')) {
        host = config('agent:vm:ip');
      } else {
        host = port_data.gateway;
      }

      // Wait for available
      var wait_opts = {
        timeout: timeout,
        context: `${system.name}_connect`,
        retry_if: () => {
          return container.inspect().then((data) => {
            return data.State.Running;
          });
        },
      };

      var address = `tcp://${host}:${port_data.port}`;
      publish("system.run._wait_available.status", _.merge(port_data, {
        uri :  address,
        timeout: timeout,
        name: system.portName(port_data.name),
        type: "wait_port", system: system.name
      }));

      var running = yield net.waitService(address, wait_opts);

      if (!running) {
        var data = yield container.inspect();
        var exitCode = data.State.ExitCode;

        var log = t('errors.run_timeout_error', {
          system: system.name,
          port: port_data && port_data.port,
          timeout: timeout,
          hostname: system.url.underline,
        });

        // Format command
        var command = system.printableCommand(data, image_conf);

        if (exitCode === 0) {
          throw new SystemRunError(
            system.name,
            container,
            command,
            exitCode,
            log
          );
        } else {
          yield this.throwRunError(system, container, command, null, true, options);
        }
      }

      return true;
    });
  },

  throwRunError(system, container, command, data = null, stop = false, options = {}) {
    data = data ? promiseResolve(data) : container.inspect();
    return data.then((data) => {
      // Get container log
      var promise = container.logs({stdout: true, stderr: true}).then((stream) => {
        return defer((resolve, reject) => {
          var acc = '';
          var stdout = {
            write(data) { acc += data.toString(); }
          };
          container.modem.demuxStream(stream, stdout, stdout);
          stream.on('end', () => { resolve(acc); });
          setTimeout(() => { reject(new Error("timeout")); }, 4000);
        });
      });

      return promise.then((log) => {
        // distinguish system log output
        log = log.replace(/^/gm, ' .' + system.name + ' [log] >  ');
        var raise = () => {
          throw new SystemRunError(
            system.name,
            container,
            command,
            data.State.ExitCode,
            log
          );
        };

        // Stop container
        if (stop) {
          options = _.defaults(options, {
            kill: true, remove: config("docker:remove_container")
          });
          return this.stop(system, [container], options).then(raise);
        } else {
          raise();
        }
      });
    });
  },

  // Check and pull image
  _check_image(system, options) {
    options = _.defaults(options, {
      image_pull: true,
    });

    var _subscription = subscribe("image.check.status", (msg, env) => {
      msg.system = system;
      publish("system.run." + env.topic, msg);
    });

    return asyncUnsubscribe(this, _subscription, function* () {
      var promise;

      if ((options.build_force || options.image_pull) && !system.image.builded) {
        if (system.image.provider === 'docker') {
          promise = system.image.pull(options);
        } else if (system.image.provider === 'dockerfile') {
          promise = system.image.build(options);
        }

        // save the date provisioning
        system.image.builded = new Date();
      } else {
        promise = system.image.check()
          .then((image) => {
            if (isBlank(image)) {
              throw new ImageNotAvailable(system.name, system.image.name);
            }
            return image;
          });
      }

      var image = yield promise;

      if (!isBlank(image)) {
        return image.inspect();
      }
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
      type: "*",
    });

    // Include dead containers
    var query_options = {};
    if (options.include_dead) {
      query_options.all = true;
    }

    return lazy.docker.azkListContainers(query_options).then((containers) => {
      var instances = _.filter(containers, (container) => {
        var azk = container.Annotations.azk;
        return (
          azk.mid == system.manifest.namespace &&
          azk.sys == system.name &&
          ( options.type == "*" || azk.type == options.type )
        );
      });

      return _.sortBy(instances, (instance) => { return instance.Annotations.azk.seq; });
    });
  },

  _clean_sync_folder(system, host_folder) {
    return async(this, function* () {
      var uid_gid;
      if (config('agent:requires_vm')) {
        uid_gid = `\$(id -u ${config('agent:vm:user')}):\$(id -g ${config('agent:vm:user')})`;
      } else {
        uid_gid = `${process.getuid()}:${process.getuid()}`;
      }

      var mounted_sync_folders = '/sync_folders';
      var current_sync_folder = path.join(mounted_sync_folders, system.manifest.namespace, system.name, host_folder);

      // Script to fix sync folder
      var script = [
        `mkdir -p ${current_sync_folder}`,
        `chown -R ${uid_gid} ${mounted_sync_folders}`
      ].join(" && ");

      // Docker params
      var image_name = config('docker:image_default');
      var cmd = ["/bin/bash", "-c", script];
      var docker_opts = {
        interactive: false,
        extra: {
          HostConfig: {
            Binds: [
              `${config('paths:sync_folders')}:${mounted_sync_folders}`,
              "/etc/passwd:/etc/passwd"
            ]
          }
        }
      };

      // Run container to fix path
      var container = yield lazy.docker.run(image_name, cmd, docker_opts);
      var data      = yield container.inspect();
      yield container.remove();

      return data.State.ExitCode;
    });
  },

};

export { Run };
