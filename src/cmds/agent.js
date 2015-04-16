import { _, t, log, config, lazy_require } from 'azk';
import { defer, async } from 'azk';
import { InteractiveCmds } from 'azk/cli/interactive_cmds';
import { Helpers } from 'azk/cli/command';
import { default as tracker } from 'azk/utils/tracker';

var channel = require('postal').channel("agent");

/* global Client, spawn, net */
lazy_require(this, {
  Client: [ 'azk/agent/client' ],
  spawn: ['child-process-promise'],
  net: 'net',
});

class Cmd extends InteractiveCmds {

  get docker() {
    return require('azk/docker').default;
  }

  action(opts) {
    return this
      .callAgent(opts)
      .fin((result) => {
        process.stdin.pause();
        return result;
      });
  }

  callAgent(opts) {
    // Create a progress output
    var progress = Helpers.vmStartProgress(this);

    return async(this, function* () {
      switch (opts.action) {
        case 'startchild':
          opts.configs = yield this.getConfig(true, opts).progress(progress);
          opts.action  = "start";
          break;

        case 'start':
          // And no running
          var status = yield Client.status();
          if (!status.agent) {
            // Check and load configures
            this.warning('status.agent.wait');
            opts.configs = yield this.getConfig(false, opts).progress(progress);

            // Remove and adding vm (to refresh vm configs)
            if (config('agent:requires_vm') && opts['reload-vm']) {
              var cmd_vm = this.parent.commands.vm;
              yield cmd_vm.action({ action: 'remove', fail: () => {} });
            }

            // Generate a new tracker agent session id
            tracker.generateNewAgentSessionId();

            // Spaw daemon
            if (opts.daemon) {
              return this.spawChild(opts);
            }
          }
      }

      // Changing directory for security
      process.chdir(config('paths:azk_root'));

      // use VM?
      var require_vm = config("agent:requires_vm");
      if (require_vm) {
        var vm_data = {
          cpus: config("agent:vm:cpus"),
          memory: config("agent:vm:memory")
        };
      }
      // Track agent start
      // var agent = yield Client.status();
      // var docker_version = require_vm && !agent.agent ? "down" : yield this.docker.version();
      var subscription = channel.subscribe("started", (/* data, envelope */) => {

        console.log('agent tracking starting...');

        tracker.addData({
          // FIXME: get docker info and docker version
          // Error: Config docker:host to be set by configure
          // docker: {
          //   version: docker_version
          // },
          vm: vm_data
        });

        // /**/console.log('\n>>---------\n tracker.data:\n', require('util').inspect(tracker.data,
        //  { showHidden: false, depth: null, colors: true }), '\n>>---------\n');/*-debug-*/

        tracker.track('agent').then(function () {
          console.log('agent tracked');
          subscription.unsubscribe();
        });
      });

      // Call action in agent
      var promise = Client[opts.action](opts).progress(progress);
      return promise.then((result) => {
        if (opts.action != "status") {
          return result;
        }
        return (result.agent) ? 0 : 1;
      });
    });
  }

  spawChild(cmd_options) {
    var args = ["agent", "startchild", ..._.rest(process.argv, 4)];
    var opts = {
      detached: true,
      stdio   : [null, null, null, 'pipe'],
      cwd     : config('paths:azk_root'),
      env     : _.extend({}, process.env),
    };

    return defer((resolve) => {
      this.installSignals(resolve);
      log.debug('fork process to start agent in daemon');
      spawn("azk", args, opts)
        .progress((child) => {
          this.child = child;

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
          var buff = Buffer(JSON.stringify(cmd_options.configs));
          pipe.write(buff);
        })
        .then(() => { return 0; })
        .fail(() => { process.stdin.pause(); });
    });
  }

  installSignals(done) {
    var stopping = false;
    var gracefullExit = () => {
      if (!stopping) {
        stopping = true;
        if (this.child) {
          this.child.kill('SIGTERM');
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
          var pipe = new net.Socket({ fd: 3 });
          pipe.on('data', (buf) => {
            var configs = JSON.parse(buf.toString('utf8'));
            pipe.end();
            resolve(configs);
          });
        } catch (err) {
          reject(err);
        }
      } else {
        return Helpers.configure(this);
      }
    });
  }
}

export function init(cli) {
  cli = (new Cmd('agent {action}', cli))
    .setOptions('action', { options: ['start', 'status', 'stop', 'startchild'], hidden: ['startchild'] })
    .addOption(['--daemon'], { default: true });

  if (config('agent:requires_vm')) {
    cli.addOption(['--reload-vm'], { default: true });
  }
}
