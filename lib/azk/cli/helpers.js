"use strict";
var __moduleName = "src/cli/helpers";
var $__0 = require('azk'),
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
      if (event.type == "status") {
        switch (event.status) {
          case "not_running":
          case "already":
            cmd.fail($traceurRuntime.spread(keys, [event.status]), event.data);
            break;
          case "error":
            cmd.fail($traceurRuntime.spread(keys, [event.status]), event);
            break;
          default:
            cmd.ok($traceurRuntime.spread(keys, [event.status]), event.data);
        }
      } else if (event.type == "try_connect") {
        var tKey = $traceurRuntime.spread(keys, ["progress"]);
        log.info_t(tKey, event);
        cmd.ok(tKey, event);
      } else {
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
        return;
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