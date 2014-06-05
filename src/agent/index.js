import { Q, config, defer, log, _ } from 'azk';
import { Pid } from 'azk/utils/pid';
import { Server } from 'azk/agent/server';

var Agent = {
  wait_kill: null,

  wait_notify(status) {
    if (typeof(process.send) === 'function') {
      try {
        process.send(status);
      } catch (err) { }
    }
  },

  change_status(status) {
    this.wait_notify({ type: "status", status, pid: process.pid });
  },

  start(options) {
    var pid = this.agentPid();
    return defer((resolve, reject, notify) => {
      this.wait_notify = notify;

      if (pid.running) {
        this.change_status('already');
        resolve(1);
      } else {
        this.change_status('starting');
        if (options.daemon) {
          return this.launchDaemon();
        } else {
          this.wait_kill = resolve;
          this.processWrapper().progress(notify).fail(reject);
        }
      }
    });
  },

  stop(opts) {
    var pid  = this.agentPid();
    return defer((resolve, reject, notify) => {
      if (pid.running) {
        this.wait_notify = notify;
        this.wait_kill   = resolve;
        pid.term();
      } else {
        resolve();
      }
    });
  },

  agentPid() {
    log.info('get agent status');
    var a_pid = new Pid(config("paths:agent_pid"));
    log.info('agent is running: %s', a_pid.running);
    return a_pid;
  },

  processStateHandler() {
    var pid = this.agentPid();
    var gracefullExit = () => {
      var kill = (code) => {
        if (this.wait_kill) {
          this.change_status("stoped");
          this.wait_kill(code);
        } else {
          process.exit(code);
        }
      }

      this.change_status("stoping");
      Server.stop().progress(this.wait_notify).then(() => {
        log.info('azk has been killed by signal');
        try { pid.unlink(); } catch(e) {}
        kill(0);
      }).fail((error) => {
        config.log(error.stack || error);
        log.error(error.stack || error);
        kill(1);
      });
    }

    try {
      pid.update(process.pid);
    } catch(e){}

    process.on('SIGTERM', gracefullExit);
    process.on('SIGINT' , gracefullExit);
    process.on('SIGQUIT', gracefullExit);
  },

  processWrapper() {
    return defer((resolve, reject, notify) => {
      this.processStateHandler();
      return Server.start().then(() => {
        this.change_status("started");
      });
    });
  },

  launchDaemon() {
    return defer((done) => {
      log.debug("Launching agent in daemon mode");

      var child = require('child_process').fork(__filename, [], {
        detached   : true,
        cwd        : config('paths:azk_root'),
        env        : _.extend({
        }, process.env),
      }, (err, stdout, stderr) => {
        if (err) done.reject(err.stack);
      });

      child.unref();
      child.once('message', (msg) => {
        log.debug('agent child msg: %s', msg);
        this.change_status(msg.status);
        if (msg.status == "started") {
          done.resolve(0);
        }
      });
    });
  },
}

export { Agent };

//
// If this file is a main process, it means that
// this process is being forked by azk itself
//
if (require.main === module) {
  process.title = 'azk-agent';
  Agent.processWrapper();
}
