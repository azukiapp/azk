import { CliController } from 'cli-router';
import { _, t } from 'azk';

class Help extends CliController {
  index(params, cli) {
    var usage = this.show_full_usage(params, cli);
    this.ui.output(usage);
    return 0;
  }

  show_full_usage(params, cli) {
    var help = '';
    if (cli && _.isString(cli.help)) {
      help = cli.help;
      _.map(['usage', 'options', 'commands', 'examples'], (section) => {
        var regex = new RegExp(`^${section}:`, 'gmi');
        help = help.replace(regex, t(`commands.help.${section}`));
      });
    }
    return help;
  }
}

module.exports = Help;
