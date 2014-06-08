import { t, log } from 'azk';

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
      var keys    = ["commands", context, "status"];

      if (event.type == "status") {
        // running, starting, not_running, already
        switch(event.status) {
          case "not_running":
          case "already":
            cmd.fail([...keys, event.status]);
            break;
          case "error":
            cmd.fail([...keys, event.status], event);
            break;
          default:
            cmd.ok([...keys,  event.status]);
        }
      } else if (event.type == "try_connect") {
        log.info_t("commands.vm.progress", event);
        cmd.ok("commands.vm.progress", event);
      } else {
        console.log(event);
      }
    };
  },

  newPullProgress(cmd) {
    var mbars = cmd.newMultiBars();
    var bars  = {};

    return (event) => {
      if (event.type != "pull_msg" || !event.id) return;

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
    }
  }
}

export { Helpers };
