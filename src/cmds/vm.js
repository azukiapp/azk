import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { config, lazy_require, log, _ } from 'azk';
import { async, promiseResolve, promiseReject } from 'azk/utils/promises';
import { subscribe } from 'azk/utils/postal';

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

class VM extends CliTrackerController {
  require_installed(vm_info) {
    if (!vm_info.installed) {
      throw new RequiredError("commands.vm.not_installed");
    }
  }

  require_running(vm_info) {
    this.require_installed(vm_info);
    log.info('[vm] vm is running: %s', vm_info.running);
    if (!vm_info.running) {
      throw new RequiredError("commands.vm.not_running");
    }
  }

  index(options={}) {
    if (!config('agent:requires_vm')) {
      this.ui.fail('commands.vm.not_required');
      return promiseResolve(1);
    }

    return async(this, function* () {
      var action  = _.head((this.route && this.route.actions)) || options.action;
      var vm_name = config("agent:vm:name");
      var vm_info = yield lazy.VM.info(vm_name);

      var promise = this[`action_${action}`](vm_info, options);

      var _subscription = subscribe('vm.action.status', (data) => {
        Helpers.vmStartProgress(this.ui)(data);
      });

      return promise
        .then(function (result) {
          _subscription.unsubscribe();
          return result;
        })
        .catch(options.fail || ((error) => {
          if (error instanceof RequiredError) {
            this.ui.fail(error.key);
            return 1;
          }
          _subscription.unsubscribe();
          throw error;
        }));
    });
  }

  action_ssh(vm_info, params) {
    var result;
    try {
      this.require_running(vm_info);
      result = Helpers.requireAgent(this.ui)
        .then(() => {
          var ssh_url  = `${config('agent:vm:user')}@${config('agent:vm:ip')}`;
          var ssh_opts = "StrictHostKeyChecking=no -o LogLevel=quiet -o UserKnownHostsFile=/dev/null";
          var args     = (params['ssh-args'] || []).join(`" "`);
          var script   = `ssh -i ${config('agent:vm:ssh_key')} -o ${ssh_opts} ${ssh_url} "${args}"`;

          log.debug(script);
          return this.ui.execSh(script);
        });
    } catch (e) {
      result = promiseReject(e);
    }
    return result;
  }

  action_start(vm_info/*, _opts*/) {
    return async(this, function* () {
      if (vm_info.running) {
        this.ui.fail("commands.vm.already_running");
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
    try {
      this.require_running(vm_info);
    } catch (e) {
      return promiseReject(e);
    }
    this.ui.ok("commands.vm.running");
    return promiseResolve(0);
  }

  action_installed(vm_info) {
    try {
      this.require_installed(vm_info);
    } catch (e) {
      return promiseReject(e);
    }
    this.ui.ok("commands.vm.already_installed");
    return promiseResolve(0);
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

module.exports = VM;
