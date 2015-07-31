import { config, log, fsAsync } from 'azk';
import { publish } from 'azk/utils/postal';
import { async, promiseResolve } from 'azk/utils/promises';
import { VM  }   from 'azk/agent/vm';
import { Balancer } from 'azk/agent/balancer';
import { Api } from 'azk/agent/api';
import { net } from 'azk/utils';
import { VmStartError } from 'azk/utils/errors';

var Server = {
  starting: false,
  stopping: false,
  server: null,
  vm_started: false,
  docker_down: false,

  // stop handler
  stop_handler() {},

  // Warning: Only use test in mac
  vm_enabled: !config('agent:dev:force_disable_vm'),

  // TODO: log start machine steps
  start(stop_handler) {
    this.stop_handler = stop_handler;
    this.starting = true;
    return async(this, function* () {
      log.info_t("commands.agent.starting");

      // Start api
      yield Api.start();

      // Virtual machine is required?
      if (this.vm_enabled && config('agent:requires_vm')) {
        yield this.installVM(true);
      }

      // Load balancer
      yield this.installBalancer();

      // acive docker monitor
      this._activeDockerMonitor();

      log.info_t("commands.agent.started");
      this.starting = false;
    });
  },

  stop() {
    if (this.stopping) { return promiseResolve(); }
    this.stopping = true;
    return async(this, function* () {
      yield Api.stop();
      yield this.removeBalancer(this.docker_down);
      if (config('agent:requires_vm') && this.vm_started) {
        yield this.stopVM();
      }
      this.stopping = false;
    });
  },

  installBalancer() {
    return Balancer.start(this.vm_enabled);
  },

  removeBalancer(skip_containers) {
    return Balancer.stop(skip_containers);
  },

  installVM(start = false) {
    var vm_name = config("agent:vm:name");
    return async(this, function* () {
      var installed  = yield VM.isInstalled(vm_name);
      var running    = (installed) ? yield VM.isRunnig(vm_name) : false;
      var vm_publish = (status) => {
        publish("agent.server.installVM.status", {
          type: "status", context: "vm", status
        });
      };

      if (!installed) {
        var opts = {
          name: vm_name,
          ip  : config("agent:vm:ip"),
          boot: config("agent:vm:boot_disk"),
          data: config("agent:vm:data_disk"),
        };

        yield VM.init(opts);

        // Set ssh key
        vm_publish("sshkey");
        var file    = config("agent:vm:ssh_key") + ".pub";
        var content = yield fsAsync.readFile(file);
        VM.setProperty(vm_name, "/VirtualBox/D2D/SSH_KEY", content.toString());
      }

      if (!running && start) {
        var timeout = config("agent:vm:wait_ready");
        var result  = yield VM.start(vm_name, timeout);
        if (!result) {
          var screen = yield VM.saveScreenShot(vm_name);
          throw new VmStartError(timeout, screen);
        }
      }

      // Mount shared
      vm_publish("mounting");
      yield VM.mount(vm_name, "Root", config("agent:vm:mount_point"));
      vm_publish("mounted");

      // Mark installed
      this.vm_started = true;
    });
  },

  stopVM() {
    var vm_name = config("agent:vm:name");
    return async(this, function* () {
      var running = yield VM.isRunnig(vm_name);
      if (running) {
        yield VM.stop(vm_name, !this.vm_started);
      }
    });
  },

  _activeDockerMonitor(retry = 3) {
    var docker_host = config("docker:host");
    log.debug(`[agent] enable docker monitor with ${retry} retry.`);

    var stop = () => {
      publish("agent.docker.check.status", {
        type: "status", context: "docker", status: "down"
      });
      this.docker_down = true;
      return this.stop_handler();
    };

    var wait_options = {
      timeout: config('agent:check_interval'),
      publish_retry: false,
    };

    var check_docker_interval = config('agent:check_interval');
    var interval_fn = () => {
      net
        .waitService(docker_host, retry, wait_options)
        .then((success) => {
          if (!success) {
            log.debug(`[agent] _activeDockerMonitor - docker_host is stopped!`);
            return stop();
          }

          log.debug(`[agent] _activeDockerMonitor - docker_host checked (${docker_host}). Waiting for more ${check_docker_interval / 1000} seconds.`);
          setTimeout(interval_fn, check_docker_interval);
        })
        .catch(stop);
    };

    setTimeout(interval_fn, check_docker_interval);
  },
};

export { Server };
