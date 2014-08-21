import { config, defer, async, t, log } from 'azk';
import { VM  }   from 'azk/agent/vm';
import { Unfsd } from 'azk/agent/unfsd';
import { Balancer } from 'azk/agent/balancer';
import { net as net_utils } from 'azk/utils';
import { AgentStartError } from 'azk/utils/errors';

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
        yield this.mountShare();
      }

      // Load balancer
      yield this.installBalancer();

      log.info_t("commands.agent.started");
    });
  },

  stop() {
    return async(this, function* () {
      yield this.removeBalancer();
      if (config('agent:requires_vm')) {
        yield this.stopVM();
        yield this.removeShare();
      }
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

  mountShare() {
    return Unfsd.mount(config("agent:vm:name"));
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
        }

        yield VM.init(opts);
      }

      if (!running && start) {
        yield VM.start(vm_name);

        // Wait for vm start
        var n = (status) => notify({ type: "status", context: "vm", status });
        n("wait");
        var address = `tcp://${config("agent:vm:ip")}:22`;
        var success = yield net_utils.waitService(address, 10, { context: "vm" });
        if (!success) {
          throw new AgentStartError(t("errors.not_vm_start"));
        }
        n("initialized");

        // Upload key
        n("upkey");
        var key = config('agent:vm:ssh_key') + '.pub';
        var authoried = config('agent:vm:authorized_key');
        yield VM.copyFile(vm_name, key, authoried);
      };
    });
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

