import { _, t, log } from 'azk';
import { Client } from 'azk/agent/client';
import { AgentNotRunning } from 'azk/utils/errors';

var fmt_p = t('commands.helpers.pull.bar_progress');
var fmt_s = t('commands.helpers.pull.bar_status');
var bar_opts = {
    complete: '='
  , incomplete: ' '
  , width: 30
  , total: 100
}

var Helpers = {
  vmStartProgress(cmd) {
    return (event) => {
      if (!event) return;

      var context = event.context || "agent"
      var keys    = ["status", context];

      switch(event.type) {
        case "status":
          // running, starting, not_running, already
          switch(event.status) {
            case "not_running":
            case "already":
              cmd.fail([...keys, event.status], event.data);
              break;
            case "error":
              cmd.fail([...keys, event.status], event);
              break;
            default:
              if (event.status == "starting") {
                cmd.warning([...keys, "wait"], event.data);
              }
              cmd.ok([...keys,  event.status], event.data);
          }
          break;
        case "try_connect":
          var tKey = [...keys, "progress"];
          log.info_t(tKey, event);
          cmd.ok(tKey, event);
          break;
        case "ssh":
          if (context == "stderr")
            break;
        default:
          log.debug(event);
      }
    };
  },

  requireAgent() {
    return Client.status().then((status) => {
      if (!status.agent) {
        throw new AgentNotRunning();
      }
    });
  },

  newPullProgress(cmd) {
    var mbars = cmd.newMultiBars();
    var bars  = {};

    return (event) => {
      if (event.type != "pull_msg" || !event.id) return event;

      var status = event.statusParsed;
      var title  = `${event.id}:`;
      var bar    = bars[event.id] || cmd.newBar(mbars, fmt_p, bar_opts);

      switch(status.type) {
        case 'download':
          var progress = event.progressDetail;
          var tick     = progress.current - bar.curr;
          bar.total    = progress.total + 1;
          bar.tick(tick, { title, progress: event.progress });
          break;
        default:
          bar.tick(bar.curr, { title, fmt: fmt_s, msg: event.status });
      }

      bars[event.id] = bar;

      return false;
    }
  },

  getSystemsByName(manifest, names) {
    var systems_name = manifest.systemsInOrder();

    if (_.isString(names) && !_.isEmpty(names)) {
      systems_name = _.intersection(
        systems_name,
        _.isArray(names) ? names : names.split(',')
      );
    }

    return _.reduce(systems_name, (systems, name) => {
      systems.push(manifest.system(name, true));
      return systems;
    }, []);
  }
}

export { Helpers };
