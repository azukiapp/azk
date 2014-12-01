import { _, Q, config, defer, log, path, lazy_require, set_config } from 'azk';
import { Pid } from 'azk/utils/pid';
import { AgentStartError } from 'azk/utils/errors';

lazy_require(this, {
  Server: ['azk/agent/server'],
});

var blank_observer = {
  notify()  {},
  resolve() {},
  reject()  {},
}

var Agent = {
  observer: blank_observer,

  change_status(status, data = null) {
    this.observer.notify({ type: "status", status, pid: process.pid, data: data });
  },

  start(options) {
    var pid = this.agentPid();
    return defer((observer) => {

      // Connect observer
      this.observer = observer;

      if (pid.running) {
        this.change_status('already');
        observer.resolve(1);
      } else {
        this.change_status('starting');
        this
          .processWrapper(options.configs || {} )
          .progress(observer.notify)
          .fail((err) => {
            this.change_status("error", err.stack || err);
            this.gracefullyStop();
          });
      }
    });
  },

  stop() {
    var pid = this.agentPid();
    return pid.kill();
  },

  gracefullyStop(opts = {}) {
    var pid = this.agentPid();
    this.change_status("stopping");
    return Server
      .stop()
      .progress(this.observer.notify)
      .then(() => {
        try { pid.unlink(); } catch(e) {}
        this.change_status("stopped");
        return 0;
      })
      .fail((error) => {
        try { pid.unlink(); } catch(e) {}
        error = error.stack || error;
        log.error('agent stop error: ' + error);
        this.change_status("error", error);
        return 1;
      })
      .then(this.observer.resolve);
  },

  agentPid() {
    log.info('get agent status');
    var a_pid = new Pid(config("paths:agent_pid"));
    log.info('agent is running: %s', a_pid.running);
    return a_pid;
  },

  processStateHandler() {
    var stoping = false;
    var gracefullExit = (signal) => {
      if (!stoping) {
        var catch_err = (err) => log.error('stop error' + err.stack || err);
        try {
          stoping = true;
          log.info('Azk agent has been killed by signal');
          this.gracefullyStop().catch(catch_err);
        } catch (err) {
          catch_err(err);
        }
      }
    }

    try {
      var pid = this.agentPid();
      pid.update(process.pid);
    } catch(e){}

    process.on('SIGTERM', gracefullExit);
    process.on('SIGINT' , gracefullExit);
    process.on('SIGQUIT', gracefullExit);
    process.on('SIGUSR2', () => {
      log.info('clear observer');
      this.observer = blank_observer;
    });
  },

  processWrapper(configs) {
    // Merge configs to global confgs
    var acc_keys = 'agent:config_keys';
    _.each(configs, (value, key) => {
      set_config(key, value);
      set_config(acc_keys, [...config(acc_keys), key]);
    });

    // Set process name
    process.title = 'azk-agent ' + config('namespace');
    this.processStateHandler();

    // Start server and subsistems
    return Server.start().then(() => {
      this.change_status("started");
      log.info("agent start with pid: " + process.pid);
    });
  },
}

export { Agent };
