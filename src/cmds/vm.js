import { Q, _, config, async, t } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Server } from 'azk/agent/server';
import { VM } from 'azk/agent/vm';
import { net } from 'azk/utils';

class RequiredError extends Error {
  constructor(key) {
    this.key = key
  }
}

class VmCmd extends Command {
  require_installed(vm_info) {
    if (!vm_info.installed) {
      throw new RequiredError("commands.vm.not_installed");
    }
  }

  require_running(vm_info) {
    this.require_installed(vm_info);
    if (!vm_info.running) {
      throw new RequiredError("commands.vm.not_runnig");
    }
  }

  action(opts) {
    if (!config('agent:requires_vm')) {
      this.fail('commands.vm.not_requires');
      return 1;
    }

    return async(this, function* () {
      var action  = opts.action;
      var vm_name = config("agent:vm:name");
      var vm_info = yield VM.info(vm_name);

      var promise = this[`action_${action}`](vm_info);
      promise = promise.progress(Helpers.vmStartProgress(this));

      return promise.fail(opts.fail || ((error) => {
        if (error instanceof RequiredError) {
          this.fail(error.key);
          return 1;
        }
        throw error;
      }));
    });
  }

  action_start(vm_info) {
    return async(this, function* () {
      if (vm_info.running) {
        this.fail("commands.vm.already_running");
        return 1;
      }
      this.require_installed(vm_info);
      yield Server.installVM(true, false);
    });
  }

  action_stop(vm_info) {
    return async(this, function* () {
      this.require_running(vm_info);
      yield VM.stop(vm_info.name);
    });
  }

  action_status(vm_info) {
    return async(this, function* () {
      this.require_running(vm_info);
      this.ok("commands.vm.running");
    });
  }

  action_installed(vm_info) {
    return async(this, function* () {
      this.require_installed(vm_info);
      this.ok("commands.vm.already");
    });
  }

  action_install(vm_info) {
    return async(this, function* () {
      if (vm_info.installed) {
        throw new RequiredError("commands.vm.already");
      }
      yield Server.installVM(false, false);
    });
  }

  action_remove(vm_info) {
    return async(this, function* () {
      this.require_installed(vm_info);
      if (vm_info.running) {
        yield VM.stop(vm_info.name);
      }
      yield VM.remove(vm_info.name);
    });
  }

  action_reload(vm_info) {
    return async(this, function* () {
      this.require_installed(vm_info);

      // Remove and install
      yield this.action_remove(vm_info);
      yield this.action_install({ installed: false });

      if (vm_info.running) {
        yield this.action_start({ installed: true, name: vm_info.name });
      }
    });
  }
}

export function init(cli) {
  if (config('agent:requires_vm')) {
    (new VmCmd('vm {action}', cli))
      .setOptions('action', { options: ['install', 'installed', 'start', 'status', 'stop', 'remove', 'reload'] });
  }
}

