import { _, config, log, lazy_require, set_config, fsAsync } from 'azk';
import { defer, async, promiseResolve } from 'azk/utils/promises';
import { publish } from 'azk/utils/postal';
import { Pid } from 'azk/utils/pid';
import { AgentStopError } from 'azk/utils/errors';

var lazy = lazy_require({
  Server : ['azk/agent/server'],
});

var blank_observer = {
  resolve() {},
  reject() {},
};

var Agent = {
  observer: blank_observer,
  stopping: false,

  change_status(status, data = null) {
    publish("agent.agent.change_status.status", { type: "status", status, pid: process.pid, data: data });
  },

  start(options) {
    var pid = this.agentPid();
    return defer((observer) => {

      // Connect observer
      this.observer = observer;

      if (pid.running && pid.pid != process.pid) {
        this.change_status('already_running');
        observer.resolve(1);
      } else {
        this.change_status('starting');
        this
          .processWrapper(options.configs || {} )
          .catch((err) => {
            this.change_status("error", err);
            if (!this.stopping) {
              this.stopping = true;
              this.gracefullyStop();
            }
          });
      }
    });
  },

  // TODO: Capture agent error and show
  stop() {
    if (this.stopping) { return promiseResolve(true); }
    publish("agent.stop.status", { type: "status", status: "stopping" });
    var pid = this.agentPid();
    return pid.killAndWait()
    .then((result) => {
      if (result) { publish("agent.stop.status", { type: "status", status: "stopped" }); }
      return result;
    })
    .catch(() => {
      throw new AgentStopError();
    });
  },

  gracefullyStop() {
    var pid = this.agentPid();
    this.change_status("stopping");
    return lazy.Server
      .stop()
      .then(() => {
        try { pid.unlink(); } catch (e) {}
        this.change_status("stopped");
        return 0;
      })
      .catch((error) => {
        try { pid.unlink(); } catch (e) {}
        error = error.stack || error;
        log.error('[agent] agent stop error: ' + error);
        return 1;
      })
      .then(this.observer.resolve);
  },

  agentPid() {
    log.info('[agent] get agent status');
    var a_pid = new Pid(config("paths:agent_pid"));
    log.info('[agent] agent is running: %s', a_pid.running);
    return a_pid;
  },

  processStateHandler() {
    var gracefullExit = (signal) => {
      if (!this.stopping) {
        var catch_err = (err) => log.error('[agent] stop error' + err.stack || err);
        try {
          this.stopping = true;
          log.info('[agent] azk agent has been killed by signal: %s', signal);
          this.gracefullyStop().catch(catch_err);
        } catch (err) {
          catch_err(err);
        }
      }
    };

    try {
      var pid = this.agentPid();
      pid.update(process.pid);
    } catch (e) {}

    var signals = ['SIGTERM', 'SIGINT', 'SIGQUIT'];
    _.each(signals, (signal) => this._connectSignal(signal, gracefullExit));
  },

  _connectSignal(signal, gracefullExit) {
    process.removeAllListeners(signal);
    process.on(signal, () => gracefullExit(signal));
  },

  processWrapper(configs) {
    // Merge configs to global confgs
    var acc_keys = 'agent:config_keys';
    _.each(configs, (value, key) => {
      set_config(key, value);
      set_config(acc_keys, [...config(acc_keys)].concat(key));
    });

    // Set process name
    process.title = 'azk-agent ' + config('namespace');
    this.processStateHandler();

    // Start server and subsistems
    return async(this, function* () {
      yield lazy.Server.start(this.stop.bind(this));
      if (!this.stopping) {
        yield fsAsync.writeFile(config("paths:agent_ping"), "");
        this.change_status("started");
        publish("agent.agent.started.event", {});
        log.info("[azk] agent start with pid: " + process.pid);
      }
    });
  },
};

export { Agent };
