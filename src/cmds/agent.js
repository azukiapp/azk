import { _, t, log, fs, config, set_config, lazy_require } from 'azk';
import { Q, defer, async } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { AGENT_CODE_ERROR } from 'azk/utils/errors';

lazy_require(this, {
  Client() {
    return require('azk/agent/client').Client;
  },

  Configure() {
    return require('azk/agent/configure').Configure;
  },

  spawn: ['child-process-promise'],
});

class Cmd extends Command {
  action(opts) {
    // Fork process
    return (opts.daemon && opts.action == 'start' ) ? this.daemon(opts) : this.no_daemon(opts);
  }

  installSignals(done) {
    var stoping = false;
    var gracefullExit = () => {
      if (!stoping) {
        stoping = true;
        if (this.child) {
          process.stdin.unpipe(this.child.stdin);
          this.child.kill('SIGTERM');
        } else {
          done(1);
        }
      }
    }

    process.on('SIGTERM', gracefullExit);
    process.on('SIGINT' , gracefullExit);
    process.on('SIGQUIT', gracefullExit);
  }

  daemon(opts) {
    var args = [..._.rest(process.argv, 2), "--no-daemon"];
    var opts = {
      silent  : true,
      detached: true,
      stdio   : ['pipe', 'pipe', 'pipe'],
      cwd     : config('paths:azk_root'),
      env     : _.extend({}, process.env),
    };

    return defer((resolve, reject) => {
      this.installSignals(resolve);
      log.debug('fork process to start agent in daemon');
      spawn("azk", args, opts)
        .progress((child) => {
          this.child = child;

          // Conect outputs
          child.stderr.pipe(process.stderr);
          child.stdout.pipe(process.stdout);
          process.stdin.pipe(child.stdin);

          // Capture agent sucess
          var started = new RegExp(t('status.agent.started'));
          child.stderr.on('data', (data) => {
            data = data.toString('utf8');
            if (data.match(started)) {
              process.stdin.unpipe(child.stdin);
              process.kill(child.pid, 'SIGUSR2');
              child.unref();
              resolve(0);
            }
          });
        })
        .then((result) => { return 0; })
        .fail(reject);
    });
  }

  no_daemon(opts) {
    // Create a progress output
    var progress = Helpers.vmStartProgress(this);

    return async(this, function* () {
      // Only in start
      if (opts.action === 'start') {
        // And no running
        var status = yield Client.status();
        if (!status.agent) {
          // Check and load configures
          this.warning('status.agent.wait');
          opts.configs = yield Helpers.configure(this);

          // Remove and adding vm (to refresh vm configs)
          if (config('agent:requires_vm') && opts['reload-vm']) {
            var cmd_vm = this.parent.commands.vm;
            yield cmd_vm.action({ action: 'remove', fail: () => {} });
          }
        }
      }

      // Call action in agent
      var promise = Client[opts.action](opts).progress(progress);
      return promise.then((result) => {
        if (opts.action != "status") return result;
        return (result.agent) ? 0 : 1;
      });
    });
  }
}

export function init(cli) {
  var cli = (new Cmd('agent {action}', cli))
    .setOptions('action', { options: ['start', 'status', 'stop'] })
    .addOption(['--daemon'], { default: true });

  if (config('agent:requires_vm')) {
    cli.addOption(['--reload-vm'], { default: true });
  }
}
