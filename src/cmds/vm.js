import { Q, _, config, async, t, lazy_require } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { net } from 'azk/utils';

lazy_require(this, {
  VM: ['azk/agent/vm'],
  Server: ['azk/agent/server'],
});

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

      var promise = this[`action_${action}`](vm_info, opts);
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

  action_ssh(vm_info, opts) {
    this.require_running(vm_info);
    return async(this, function* () {
      yield Helpers.requireAgent(this);

      var ssh_url  = `${config('agent:vm:user')}@${config('agent:vm:ip')}`;
      var ssh_opts = "StrictHostKeyChecking=no -o LogLevel=quiet -o UserKnownHostsFile=/dev/null"
      var args     = opts.__leftover.join(`" "`);
      var script   = `ssh -i ${config('agent:vm:ssh_key')} -o ${ssh_opts} ${ssh_url} "${args}"`

      this.info(script);
      return this.execSh(script);
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

  action_remove(vm_info) {
    return async(this, function* () {
      this.require_installed(vm_info);
      if (vm_info.running) {
        yield VM.stop(vm_info.name);
      }
      yield VM.remove(vm_info.name);
    });
  }
}

export function init(cli) {
  if (config('agent:requires_vm')) {
    (new VmCmd('vm {*action}', cli))
      .setOptions('action', { options: ['ssh', 'installed', 'start', 'status', 'stop', 'remove'] });
  }
}

