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
  getSystemsByName: function(manifest, names) {
    var systems_name = manifest.systemsInOrder();
    if (_.isString(names) && !_.isEmpty(names)) {
      systems_name = _.intersection(systems_name, _.isArray(names) ? names : names.split(','));
    }
    return _.reduce(systems_name, (function(systems, name) {
      systems.push(manifest.system(name, true));
      return systems;
    }), []);
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