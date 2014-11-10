import { _, t, log, fs, config, set_config, lazy_require } from 'azk';
import { Q, defer, async } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { AGENT_CODE_ERROR } from 'azk/utils/errors';

lazy_require(this, {
  Client: [ 'azk/agent/client' ],
  Configure: [ 'azk/agent/configure' ],
  spawn: ['child-process-promise'],
  net: 'net',
});

class Cmd extends Command {
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
      switch(opts.action) {
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

            // Spaw daemon
            if (opts.daemon) {
              return this.spawChild(opts);
            }
          }
      }

      // Changing directory for security
      process.chdir(config('paths:azk_root'));

      // Call action in agent
      var promise = Client[opts.action](opts).progress(progress);
      return promise.then((result) => {
        if (opts.action != "status") return result;
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

    return defer((resolve, reject) => {
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
        .then((result) => { return 0; })
        .fail(() => { process.stdin.pause(); });
    });
  }

  installSignals(done) {
    var stoping = false;
    var gracefullExit = () => {
      if (!stoping) {
        stoping = true;
        if (this.child) {
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

  getConfig(waitpipe, options = {}) {
    return defer((resolve, reject) => {
      if (waitpipe) {
        try {
          var pipe = new net.Socket({ fd: 3 });
          pipe.on('data', (buf) => {
            var configs = JSON.parse(buf.toString('utf8'))
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
  var cli = (new Cmd('agent {action}', cli))
    .setOptions('action', { options: ['start', 'status', 'stop', 'startchild'] })
    .addOption(['--daemon'], { default: true })

  if (config('agent:requires_vm')) {
    cli.addOption(['--reload-vm'], { default: true });
  }
}
