import { config, Q, defer, async, log } from 'azk';
import { VM  }   from 'azk/agent/vm';
import { Unfsd } from 'azk/agent/unfsd';
import { Balancer } from 'azk/agent/balancer';

var Server = {
  server: null,

  // TODO: log start machine steps
  start() {
    return async(this, function* () {
      log.info_t("commands.agent.starting");

      // Virtual machine is required?
      if (config('agent:requires_vm')) {
        yield this.installShare();
        yield this.installVM(true);
      }

      // Load balancer
      yield this.installBalancer();

      log.info_t("commands.agent.started");
    });
  },

  stop() {
    return async(this, function* () {
      yield this.removeBalancer();
      yield this.stopVM();
      yield this.removeShare();
    });
  },

  installBalancer() {
    return Balancer.start();
  },

  removeBalancer() {
    return Balancer.stop();
  },

  installShare() {
    return Unfsd.start();
  },

  removeShare() {
    return Unfsd.stop();
  },

  installVM(start = false, progress = () => {}) {
    var self = this;
    var vm_name = config("agent:vm:name");
    return Q.async(function* () {
      var installed = yield VM.isInstalled(vm_name);
      var running   = (installed) ? yield VM.isRunnig(vm_name) : false;

      if (!installed) {
        var opts = {
          name: vm_name,
          ip  : config("agent:vm:ip"),
          boot: config("agent:vm:boot_disk"),
          data: config("agent:vm:data_disk"),
        }

        yield VM.init(opts);
      }

      if (!running && start) {
        yield VM.start(vm_name);
        yield VM.configureIp(vm_name, config("agent:vm:ip")).progress(progress);
        yield Unfsd.mount(vm_name).progress(progress);
      };
    })();
  },

  stopVM(running) {
    var vm_name = config("agent:vm:name");
    return async(function* () {
      running = (running == null) ? (yield VM.isRunnig(vm_name)) : false;
      if (running) {
        yield VM.stop(vm_name);
      }
    });
  },
}

export { Server };

