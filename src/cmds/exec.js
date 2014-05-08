import { Q, _, config, t } from 'azk';
import { Command } from 'azk/cli/command';
import { Image } from 'azk/images';

class ExecCmd extends Command {
  action(opts) {
    var self = this;
    return Q.async(function* () {
      if (opts.image) {
        var image = new Image(opts.image);
        var mbars = self.newMultiBars();
        var bars  = {};
        var fmt_p = t('commands.helpers.pull.bar_progress');
        var fmt_s = t('commands.helpers.pull.bar_status');

        self.ok('commands.exec.check_image', image.name);
        yield image.pull(self.stdout).progress((event) => {
          var status = event.statusParsed;
          if (!event.id) return;

          var bar = bars[event.id] || self.newBar(mbars, fmt_p, {
              complete: '='
            , incomplete: ' '
            , width: 30
            , total: 100
          });

          //console.log(event);
          var title = `${event.id}:`;
          switch(status.type) {
            case 'download':
              var progress = event.progressDetail;
              bar.total = progress.total + 1;
              bar.tick(progress.current - bar.curr, { title, progress: event.progress });
              break;
            default:
              bar.tick(bar.curr, { title, format: fmt_s, msg: event.status });
          }

          bars[event.id] = bar;
        });


        return 0;
      }
    })();
  }
}

export function init(cli) {
  (new ExecCmd('exec {*cmd}', cli))
    .addOption(['--image', '-I'], { type: String, desc: "Image to run command" })
    .addOption(['--interactive', '-i'], { desc: "Interactive shell" })
}
