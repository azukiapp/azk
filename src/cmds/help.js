import { CliControllers } from 'cli-router';
import { _, t } from 'azk';

class Help extends CliControllers.Help {
  index(params, cli) {
    var usage = super.index(params, cli);
    usage = this.colorizeSections(params, usage);
    this.ui.output(usage);
    return 0;
  }

  colorizeSections(params, usage) {
    _.map(this.sections, (section) => {
      var regex = new RegExp(`^${section}:`, 'gmi');
      usage = usage.replace(regex, t(`commands.help.${section}`));
    });
    return usage;
  }
}

module.exports = Help;
