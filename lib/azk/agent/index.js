"use strict";
var __moduleName = "src/agent/index";
var $__1 = require('azk'),
    Q = $__1.Q,
    config = $__1.config,
    defer = $__1.defer,
    log = $__1.log,
    _ = $__1._;
var Pid = require('azk/utils/pid').Pid;
var AgentStartError = require('azk/utils/errors').AgentStartError;
function Server() {
  return require('azk/agent/server').Server;
}
var Agent = {
  wait: null,
  wait_notify: function(status) {
    if (typeof(process.send) === 'function') {
      try {
        process.send(status);
      } catch (err) {}
    }
  },
  change_status: function(status) {
    var data = arguments[1] !== (void 0) ? arguments[1] : null;
    this.wait_notify({
      type: "status",
      status: status,
      pid: process.pid,
      data: data
    });
  },
  start: function(options) {
    var $__0 = this;
    var pid = this.agentPid();
    return defer((function(resolve, reject, notify) {
      $__0.wait_notify = notify;
      if (pid.running) {
        $__0.change_status('already');
        resolve(1);
      } else {
        $__0.change_status('starting');
        if (options.daemon) {
          return $__0.launchDaemon();
        } else {
          $__0.wait = resolve;
          $__0.processWrapper().progress(notify).fail((function(err) {
            $__0.change_status("error", err.stack || err);
            return $__0.stop().progress(notify).then((function() {
              return 0;
            }));
          }));
        }
      }
    }));
  },
  stop: function(opts) {
    var $__0 = this;
    var pid = this.agentPid();
    return defer((function(resolve, reject, notify) {
      if ($__0.wait) {
        $__0.change_status("stoping");
        return Server().stop().progress(notify).then((function() {
          try {
            pid.unlink();
          } catch (e) {}
          $__0.change_status("stoped");
          $__0.wait(0);
          resolve(0);
        })).fail((function(error) {
          try {
            pid.unlink();
          } catch (e) {}
          $__0.change_status("error", error.stack || error);
          $__0.wait(1);
          reject(1);
        }));
      }
      if (pid.running)
        pid.term();
      return resolve();
    }));
  },
  agentPid: function() {
    log.info('get agent status');
    var a_pid = new Pid(config("paths:agent_pid"));
    log.info('agent is running: %s', a_pid.running);
    return a_pid;
  },
  processStateHandler: function() {
    var $__0 = this;
    var pid = this.agentPid();
    var stoping = false;
    var gracefullExit = (function() {
      if (!stoping) {
        stoping = true;
        log.info('Azk agent has been killed by signal');
        return $__0.stop({}, true);
      }
    });
    try {
      pid.update(process.pid);
    } catch (e) {}
    process.on('SIGTERM', gracefullExit);
    process.on('SIGINT', gracefullExit);
    process.on('SIGQUIT', gracefullExit);
  },
  processWrapper: function() {
    var $__0 = this;
    process.title = 'azk-agent';
    return defer((function(resolve, reject, notify) {
      $__0.processStateHandler();
      return Server().start().then((function() {
        $__0.change_status("started");
      }));
    }));
  },
  launchDaemon: function() {
    var $__0 = this;
    return defer((function(done) {
      var child_process = require('child_process');
      log.debug("Launching agent in daemon mode");
      var child = child_process.fork(__filename, [], {
        silent: true,
        detached: true,
        cwd: config('paths:azk_root'),
        env: _.extend({}, process.env)
      }, (function(err, stdout, stderr) {
        if (err)
          done.reject(err.stack);
      }));
      var exit = (function() {
        done.resolve(1);
      });
      var msg_cb = (function(msg) {
        log.debug('agent child msg: %s', msg);
        $__0.change_status(msg.status, msg.data);
        if (msg.status == "started") {
          child.removeListener('exit', exit);
          child.removeListener('message', msg_cb);
          child.unref();
          return done.resolve(0);
        }
      });
      child.on('exit', exit);
      child.on('message', msg_cb);
    }));
  }
};
;
if (require.main === module) {
  Agent.wait = function(code) {
    process.exit(code);
  };
  Agent.processWrapper().fail((function(error) {
    Agent.change_status("error", error.toString());
    return Agent.stop();
  }));
}
module.exports = {
  get Agent() {
    return Agent;
  },
  __esModule: true
};
//# sourceMappingURL=index.js.map