import { Q, _, config, async } from 'azk';
import { Command } from 'azk/cli/command';
import { VM } from 'azk/agent/vm';
import { net } from 'azk/utils';

class VmCmd extends Command {
  action(opts) {
    return async(this, function* () {
      var action    = opts.action;
      var vm_name   = config("agent:vm:name");
      var installed = yield VM.isInstalled(vm_name);
      var running   = (installed) ? yield VM.isRunnig(vm_name) : false;

      if ((action != "install" || action == "remove") && !installed) {
        this.fail("commands.vm.not_installed");
        return 1;
      }

      var not_require_running = ["start", "install", "installed", "remove"];
      if (!_.contains(not_require_running, action) && !running) {
        this.fail("commands.vm.not_runnig");
        return 1;
      }

      return this[`action_${action}`](vm_name, running, installed);
    });
  }

  action_start(vm_name, running) {
    if (running) {
      this.fail("commands.vm.running");
      return 1;
    }

    return async(this, function* () {
      this.ok("commands.vm.starting");
      yield VM.start(vm_name);
      this.ok("commands.vm.started");

      this.ok("commands.vm.setting_network");
      var confg = VM.configureIp(vm_name, config("agent:vm:ip"));
      yield confg.progress((event) => {
        if (event && event.type == 'try_connect') {
          this.ok("commands.vm.network_pogress", event);
        }
      });
      this.ok("commands.vm.network_configured");
    });
  }

  action_stop(vm_name, running) {
    if (!running) {
      this.fail("commands.vm.not_runnig");
      return 1;
    }

    this.ok("commands.vm.stoping");
    return VM.stop(vm_name).then(() => {
      this.ok("commands.vm.stoped");
      return 0;
    });
  }

  action_status() {
    this.ok("commands.vm.running");
  }

  action_installed(vm_name, __, installed) {
    if (installed) {
      this.ok("commands.vm.installed");
      return 0;
    }
  }

  action_install(vm_name, __, installed) {
    if (installed) {
      this.fail("commands.vm.installed");
      return 1;
    }

    return async(this, function* () {
      var opts = {
        name: vm_name,
        ip  : config("agent:vm:ip"),
        boot: config("agent:vm:boot_disk"),
        data: config("agent:vm:data_disk"),
      }

      var info = yield VM.init(opts);
      this.ok("commands.vm.installed_successfully");
    });
  }

  action_remove(vm_name, running) {
    return async(this, function* () {
      if (running) {
        this.ok("commands.vm.stoping");
        yield VM.stop(vm_name);
        this.ok("commands.vm.stoped");
      }
      this.ok("commands.vm.removing");
      yield VM.remove(vm_name);
      this.ok("commands.vm.removed");
    });
  }
}

export function init(cli) {
  (new VmCmd('vm {action}', cli))
    .setOptions('action', { options: ['install', 'installed', 'start', 'status', 'stop', 'remove'] });
}

