import { CliController } from 'cli-router';

class Help extends CliController {
  index(params, cli) {
    this.ui.output(cli.help);
    return 0;
  }
}

module.exports = Help;
