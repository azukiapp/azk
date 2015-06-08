import { config, lazy_require, log } from 'azk';
import { subscribe } from 'azk/utils/postal';
import { async, promiseResolve } from 'azk/utils/promises';
import { InteractiveCmds } from 'azk/cli/interactive_cmds';
import { Helpers } from 'azk/cli/command';

var lazy = lazy_require({
  VM: ['azk/agent/vm'],
  Server: ['azk/agent/server'],
  Client: ['azk/agent/client'],
});

class RequiredError extends Error {
  constructor(key) {
    super();
    this.key = key;
  }
}

class VmCmd extends InteractiveCmds {
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
      this.fail('commands.vm.not_required');
      return 1;
    }

    return async(this, function* () {
      var action  = opts.action;
      var vm_name = config("agent:vm:name");
      var vm_info = yield lazy.VM.info(vm_name);

      var promise = this[`action_${action}`](vm_info, opts);

      var _subscription = subscribe('vm.action.status', (data) => {
        Helpers.vmStartProgress(this)(data);
      });

      return promise
        .then(function (result) {
          _subscription.unsubscribe();
          return result;
        })
        .catch(opts.fail || ((error) => {
          if (error instanceof RequiredError) {
            this.fail(error.key);
            return 1;
          }
          _subscription.unsubscribe();
          throw error;
        }));
    });
  }

  action_ssh(vm_info, opts) {
    this.require_running(vm_info);
    return async(this, function* () {
      yield Helpers.requireAgent(this);

      var ssh_opts = lazy.Client.ssh_opts();
      var args     = opts.__leftover.join(`" "`);
      var script   = `ssh ${ssh_opts.opts} ${ssh_opts.url} "${args}"`;

      log.debug(script);
      return this.execSh(script);
    });
  }

  action_start(vm_info/*, _opts*/) {
    return async(this, function* () {
      if (vm_info.running) {
        this.fail("commands.vm.already_running");
        return 1;
      }
      this.require_installed(vm_info);
      yield lazy.Server.installVM(true, false);
    });
  }

  action_stop(vm_info, opts) {
    return async(this, function* () {
      this.require_running(vm_info);
      yield lazy.VM.stop(vm_info.name, opts.force);
    });
  }

  action_status(vm_info) {
    this.require_running(vm_info);
    this.ok("commands.vm.running");
    return promiseResolve();
  }

  action_installed(vm_info) {
    this.require_installed(vm_info);
    this.ok("commands.vm.already_installed");
    return promiseResolve();
  }

  action_remove(vm_info, opts) {
    return async(this, function* () {
      this.require_installed(vm_info);
      if (vm_info.running) {
        yield lazy.VM.stop(vm_info.name, opts.force);
      }
      yield lazy.VM.remove(vm_info.name);
    });
  }
}

export function init(cli) {
  if (config('agent:requires_vm')) {
    (new VmCmd('vm {*action}', cli))
      .setOptions('action', { options: ['ssh', 'installed', 'start', 'status', 'stop', 'remove'] })
      .addOption(['--force'], { default: false });
  }
}
