"use strict";
var __moduleName = "src/cli/helpers";
var $__0 = require('azk'),
    _ = $__0._,
    t = $__0.t,
    log = $__0.log;
var Client = require('azk/agent/client').Client;
var AgentNotRunning = require('azk/utils/errors').AgentNotRunning;
var fmt_p = t('commands.helpers.pull.bar_progress');
var fmt_s = t('commands.helpers.pull.bar_status');
var bar_opts = {
  complete: '=',
  incomplete: ' ',
  width: 30,
  total: 100
};
var Helpers = {
  vmStartProgress: function(cmd) {
    return (function(event) {
      if (!event)
        return;
      var context = event.context || "agent";
      var keys = ["status", context];
      switch (event.type) {
        case "status":
          switch (event.status) {
            case "not_running":
            case "already":
              cmd.fail($traceurRuntime.spread(keys, [event.status]), event.data);
              break;
            case "error":
              cmd.fail($traceurRuntime.spread(keys, [event.status]), event);
              break;
            default:
              if (event.status == "starting") {
                cmd.warning($traceurRuntime.spread(keys, ["wait"]), event.data);
              }
              cmd.ok($traceurRuntime.spread(keys, [event.status]), event.data);
          }
          break;
        case "try_connect":
          var tKey = $traceurRuntime.spread(keys, ["progress"]);
          log.info_t(tKey, event);
          cmd.ok(tKey, event);
          break;
        case "ssh":
          if (context == "stderr")
            break;
        default:
          log.debug(event);
      }
    });
  },
  requireAgent: function() {
    return Client.status().then((function(status) {
      if (!status.agent) {
        throw new AgentNotRunning();
      }
    }));
  },
  newPullProgress: function(cmd) {
    var mbars = cmd.newMultiBars();
    var bars = {};
    return (function(event) {
      if (event.type != "pull_msg" || !event.id)
        return event;
      var status = event.statusParsed;
      var title = (event.id + ":");
      var bar = bars[event.id] || cmd.newBar(mbars, fmt_p, bar_opts);
      switch (status.type) {
        case 'download':
          var progress = event.progressDetail;
          var tick = progress.current - bar.curr;
          bar.total = progress.total + 1;
          bar.tick(tick, {
            title: title,
            progress: event.progress
          });
          break;
        default:
          bar.tick(bar.curr, {
            title: title,
            fmt: fmt_s,
            msg: event.status
          });
      }
      bars[event.id] = bar;
      return false;
    });
  },
  escapeCapture: function(callback) {
    var escapeBuffer = false;
    var escape = false;
    return (function(event) {
      if (event.type == "stdin_pipe") {
        var stdin = event.data[0].stdin;
        var stream = event.data[0].stream;
        var container = event.id;
        var stopped = false;
        stdin.on('data', function(key) {
          if (stopped)
            return false;
          var ch = key.toString(stdin.encoding || 'utf-8');
          if (escapeBuffer && ch === '~') {
            escapeBuffer = false;
            escape = true;
          } else if (ch === '\r') {
            escapeBuffer = true;
            stream.write(key);
          } else {
            if (escape) {
              stopped = callback(ch, container);
              escape = false;
            } else {
              stream.write(key);
            }
            escapeBuffer = false;
          }
        });
      }
      return true;
    });
  }
};
;
module.exports = {
  get Helpers() {
    return Helpers;
  },
  __esModule: true
};
//# sourceMappingURL=helpers.js.map