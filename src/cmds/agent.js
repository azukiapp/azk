import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { _, config, lazy_require, log } from 'azk';
import { asyncUnsubscribe } from 'azk/utils/promises';
import { subscribe } from 'azk/utils/postal';

var lazy = lazy_require({
  Client      : [ 'azk/agent/client' ],
  spawn       : ['child-process-promise'],
  net         : 'net',
  VMController: 'azk/cmds/vm',
});

class Agent extends CliTrackerController {
  get docker() {
    return require('azk/docker').default;
  }

  index(opts) {
    return this
      .callAgent(opts)
      .then((result) => {
        process.stdin.pause();
        return result;
      });
  }

  callAgent(opts) {
    var params = {
      action: _.head(this.route.actions) || opts.action
    };
    // Create a progress output
    var _subscription = subscribe('#.status', (data) => {
      Helpers.vmStartProgress(this.ui)(data);
    });

    return asyncUnsubscribe(this, _subscription, function* () {
      if (params.action === 'start') {
        // And no running
        var status = yield lazy.Client.status(opts.action, false);
        if (!status.agent) {
          // Run in daemon mode
          if (!opts['no-daemon']) {
            var args = _.clone(this.args);
            var cmd  = `azk agent-daemon --no-daemon "${args.join('" "')}"`;
            return this.ui.execSh(cmd, {
              detached: false,
              stdio: [ 'ignore', process.stdout, process.stderr ]
            });
          }

          // Check and load configures
          this.ui.warning('status.agent.wait');
          params.configs = yield Helpers.configure(this.ui);

          // Remove and adding vm (to refresh vm configs)
          if (config('agent:requires_vm') && !opts['no-reload-vm']) {
            var cmd_vm = new lazy.VMController({ ui: this.ui });
            yield cmd_vm.index({ action: 'remove', fail: () => {} });
          }

          // Generate a new tracker agent session id
          this.ui.tracker.generateNewAgentSessionId();
          this.trackStart();
        }
      }

      // Changing directory for security
      process.chdir(config('paths:azk_root'));

      // Call action in agent
      var promise = lazy.Client[params.action](params);
      return promise.then((result) => {
        if (params.action != "status") {
          return result;
        }
        return (result.agent) ? 0 : 1;
      });
    });
  }

  trackStart() {
    // use VM?
    var _subscription = subscribe("agent.agent.started.event", (/* data, envelope */) => {
      // auto-unsubscribe
      _subscription.unsubscribe();

      var vm_data = {};

      if (config("agent:requires_vm")) {
        vm_data = {
          cpus: config("agent:vm:cpus"),
          memory: config("agent:vm:memory")
        };
      }

      // Track agent start
      this.docker.version().then((result) => {
        this.addDataToTracker({
          vm: vm_data,
          docker: {
            version: result
          }
        });

        return this.sendTrackerData();
      }, (error) => {
        log.info(error);
      });
    });
  }
}

module.exports = Agent;
