import { Q, config, defer, log, _, lazy_require } from 'azk';
import { config, set_config } from 'azk';
import { Pid } from 'azk/utils/pid';
import { AgentStartError } from 'azk/utils/errors';

lazy_require(this, {
  Server() {
    return require('azk/agent/server').Server;
  }
});

var Agent = {
  wait: null,

  wait_notify(status) {
    if (typeof(process.send) === 'function') {
      try {
        process.send(status);
      } catch (err) { }
    }
  },

  change_status(status, data = null) {
    this.wait_notify({ type: "status", status, pid: process.pid, data: data });
  },

  start(options) {
    var pid = this.agentPid();
    return defer((resolve, reject, notify) => {
      this.wait_notify = notify;
      options = _.defaults(options, { configs: {} });

      if (pid.running) {
        this.change_status('already');
        resolve(1);
      } else {
        this.change_status('starting');
        if (options.daemon) {
          return this.launchDaemon(options.configs);
        } else {
          this.wait = resolve;
          this.processWrapper(options.configs).progress(notify).fail((err) => {
            this.change_status("error", err.stack || err);
            return this.stop().progress(notify).then(() => {
              return 0;
            });
          });
        }
      }
    });
  },

  stop(opts) {
    var pid = this.agentPid();
    return defer((resolve, reject, notify) => {
      if (this.wait) {
        this.change_status("stoping");

        return Server.stop().progress(notify).then(() => {
          try { pid.unlink(); } catch(e) {}
          this.change_status("stoped");
          this.wait(0);
          resolve(0);
        }).fail((error) => {
          try { pid.unlink(); } catch(e) {}
          this.change_status("error", error.stack || error);
          this.wait(1);
          reject(1);
        });
      }

      // Stop by signal
      if (pid.running) pid.term();

      return resolve();
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
    var stoping = false;
    var gracefullExit = () => {
      if (!stoping) {
        stoping = true;
        log.info('Azk agent has been killed by signal');
        return this.stop({}, true);
      }
    }

    try {
      pid.update(process.pid);
    } catch(e){}

    process.on('SIGTERM', gracefullExit);
    process.on('SIGINT' , gracefullExit);
    process.on('SIGQUIT', gracefullExit);
  },

  processWrapper(configs) {
    // Merge configs to global confgs
    var acc_keys = 'agent:config_keys';
    _.each(configs, (value, key) => {
      set_config(key, value);
      set_config(acc_keys, [...config(acc_keys), key]);
    });

    // Set process name
    process.title = 'azk-agent';

    return defer((resolve, reject, notify) => {
      this.processStateHandler();
      return Server.start().then(() => {
        this.change_status("started");
      });
    });
  },

  launchDaemon(configs) {
    return defer((done) => {
      var child_process = require('child_process');

      log.debug("Launching agent in daemon mode");
      var child = child_process.fork(__filename, [], {
        silent  : false,
        detached: true,
        cwd     : config('paths:azk_root'),
        env     : _.extend({}, process.env),
      }, (err, stdout, stderr) => {
        if (err) done.reject(err.stack);
      });

      var exit = () => {
        done.resolve(1);
      }

      var msg_cb = (msg) => {
        log.debug('agent child msg: %s', msg);
        this.change_status(msg.status, msg.data);
        if (msg.status == "started") {
          child.removeListener('exit', exit);
          child.removeListener('message', msg_cb);
          child.unref();
          return done.resolve(0);
        }
      };

      // Connect child events
      child.on('exit', exit);
      child.on('message', msg_cb);

      // Send start to child with confgs
      child.send({ type: 'start', configs: configs });
    });
  },
}

export { Agent };

//
// If this file is a main process, it means that
// this process is being forked by azk itself
if (require.main === module) {
  Agent.wait = function(code) {
    process.exit(code);
  }

  process.on('message', (msg) => {
    if (msg.type = 'start') {
      Agent.processWrapper(msg.configs).fail((error) => {
        Agent.change_status("error", error.toString());
        return Agent.stop()
      });
    }
  });
}
