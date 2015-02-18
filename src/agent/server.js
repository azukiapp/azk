import { config, async, log } from 'azk';
import { VM  }   from 'azk/agent/vm';
import { Balancer } from 'azk/agent/balancer';
import { Api } from 'azk/agent/api';

var qfs = require('q-io/fs');

var Server = {
  server: null,
  vm_started: false,

  // Warning: Only use test in mac
  vm_enabled: true,

  // TODO: log start machine steps
  start() {
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
    });
  },

  stop() {
    return async(this, function* () {
      yield Api.stop();
      yield this.removeBalancer();
      if (config('agent:requires_vm')) {
        yield this.stopVM();
      }
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
    return async(this, function* (notify) {
      var installed = yield VM.isInstalled(vm_name);
      var running   = (installed) ? yield VM.isRunnig(vm_name) : false;

      if (!installed) {
        var opts = {
          name: vm_name,
          ip  : config("agent:vm:ip"),
          boot: config("agent:vm:boot_disk"),
          data: config("agent:vm:data_disk"),
        };

        yield VM.init(opts);

        // Set ssh key
        notify({ type: "status", context: "vm", status: "sshkey" });
        var file    = config('agent:vm:ssh_key') + '.pub';
        var content = yield qfs.read(file);
        VM.propertySet(vm_name, "/VirtualBox/D2D/SSH_KEY", content);
      }

      if (!running && start) {
        yield VM.start(vm_name, true);
      }

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
};

export { Server };
