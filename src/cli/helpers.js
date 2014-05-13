import { t } from 'azk';
import { Image } from 'azk/images';

var fmt_p = t('commands.helpers.pull.bar_progress');
var fmt_s = t('commands.helpers.pull.bar_status');
var bar_opts = {
    complete: '='
  , incomplete: ' '
  , width: 30
  , total: 100
}

var Helpers = {
  pull_image(cmd, image_name) {
    var image = new Image(image_name);
    var mbars = cmd.newMultiBars();
    var bars  = {};

    cmd.ok('commands.exec.check_image', image.name);
    return image.pull(cmd.stdout().isTTY ? null : cmd.stdout()).progress((event) => {
      if (!event.id) return;

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
    });

  }
}

export { Helpers };
