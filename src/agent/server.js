import { config, log, fsAsync } from 'azk';
import { publish } from 'azk/utils/postal';
import { async, promiseResolve } from 'azk/utils/promises';
import { VM  }   from 'azk/agent/vm';
import { Balancer } from 'azk/agent/balancer';
import { Api } from 'azk/agent/api';
import { VmStartError } from 'azk/utils/errors';

var Server = {
  starting: false,
  stopping: false,
  server: null,
  vm_started: false,

  // stop handler
  stop_handler() {},

  // Warning: Only use test in mac
  vm_enabled: true,

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

      log.info_t("commands.agent.started");
      this.starting = false;
    });
  },

  stop() {
    if (this.stopping) { return promiseResolve(); }
    this.stopping = true;
    return async(this, function* () {
      yield Api.stop();
      yield this.removeBalancer();
      if (config('agent:requires_vm') && this.vm_started) {
        yield this.stopVM();
      }
      this.stopping = false;
    });
  },

  installBalancer() {
    return Balancer.start(this.vm_enabled);
  },

  removeBalancer() {
    return Balancer.stop();
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

      this._activeVMMonitor(vm_name);

      // Mount shared
      vm_publish("mounting");
      yield VM.mount(vm_name, "Root", config("agent:vm:mount_point"));
      vm_publish("mounted");

      // Mark installed
      this.vm_started = true;
    });
  },

  stopVM(running) {
    var vm_name = config("agent:vm:name");
    return async(this, function* () {
      running = yield VM.isRunnig(vm_name);
      if (running) {
        yield VM.stop(vm_name, !this.vm_started);
      }
    });
  },

  _activeVMMonitor(vm_name) {
    var interval, stop = () => {
      clearTimeout(interval);
      publish("agent.server.installVM.status", {
        type: "status", context: "vm", status: "down"
      });
      return this.stop_handler();
    };

    interval = setInterval(() => {
      if (this.stopping) {
        return clearTimeout(interval);
      }
      VM.isRunnig(vm_name).then((result) => {
        if (!result) { stop(); }
      })
      .catch(stop);
    }, 5000);
  }
};

export { Server };
