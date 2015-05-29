import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { _, config, lazy_require, log, t } from 'azk';
import { defer, asyncUnsubscribe } from 'azk/utils/promises';
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
        if (opts.child) {
          params.configs = yield this.getConfig(true, params);
        } else {
          // And no running
          var status = yield lazy.Client.status(opts.action);
          if (!status.agent) {
            // Check and load configures
            this.ui.warning('status.agent.wait');
            params.configs = yield this.getConfig(false, params);

            // Remove and adding vm (to refresh vm configs)
            if (config('agent:requires_vm') && opts['reload-vm']) {
              var cmd_vm = new lazy.VMController({ ui: this.ui });
              yield cmd_vm.index({ action: 'remove', fail: () => {} });
            }

            // Generate a new tracker agent session id
            this.ui.tracker.generateNewAgentSessionId();

            // Spaw daemon
            if (!opts['no-daemon']) {
              return this.spawChild(params);
            }
          }
        }
      }

      // Changing directory for security
      process.chdir(config('paths:azk_root'));

      // use VM?
      var _agent_started_subscription = subscribe("agent.agent.started.event", (/* data, envelope */) => {
        // auto-unsubscribe
        _agent_started_subscription.unsubscribe();

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
        });
      });

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

  spawChild(controller_params) {
    var options = ["--child"].concat(process.argv.slice(4) || []);
    var args    = ["agent", "start", ..._.uniq(options)];
    var params = {
      detached: true,
      stdio   : [null, null, null, 'pipe'],
      cwd     : config('paths:azk_root'),
      env     : _.extend({}, process.env),
    };

    return defer((resolve) => {
      this.installSignals(resolve);
      log.debug('fork process to start agent in daemon');
      lazy.spawn("azk", args, params)
        .progress((child) => {
          this.ui.child = child;

          // Conect outputs
          child.stderr.pipe(process.stderr);
          child.stdout.pipe(process.stdout);

          // Capture agent sucess
          var started = new RegExp(t('status.agent.started'));
          child.stderr.on('data', (data) => {
            data = data.toString('utf8');
            if (data.match(started)) {
              child.stderr.unpipe(process.stderr);
              child.stdout.unpipe(process.stdout);
              process.kill(child.pid, 'SIGUSR2');
              resolve(0);
            }
          });

          // Send configs to child
          var pipe = child.stdio[3];
          var buff = Buffer(JSON.stringify(controller_params.configs));
          pipe.write(buff);
        })
        .then(() => { return 0; })
        .catch(() => { process.stdin.pause(); });
    });
  }

  installSignals(done) {
    var stopping = false;
    var gracefullExit = () => {
      if (!stopping) {
        stopping = true;
        if (this.ui.child) {
          this.ui.child.kill('SIGTERM');
        } else {
          done(1);
        }
      }
    };

    process.on('SIGTERM', gracefullExit);
    process.on('SIGINT' , gracefullExit);
    process.on('SIGQUIT', gracefullExit);
  }

  getConfig(waitpipe) {
    return defer((resolve, reject) => {
      if (waitpipe) {
        try {
          var pipe = new lazy.net.Socket({ fd: 3 });
          pipe.on('data', (buf) => {
            var configs = JSON.parse(buf.toString('utf8'));
            pipe.end();
            resolve(configs);
          });
        } catch (err) {
          reject(err);
        }
      } else {
        return Helpers.configure(this.ui);
      }
    });
  }
}

module.exports = Agent;
