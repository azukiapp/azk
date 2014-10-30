import { Q, _, config, t } from 'azk';
import { Command, Helpers } from 'azk/cli/command';

class HelpCmd extends Command {
  action(opts) {
    this.parent.showUsage(opts.command);
    return 0;
  }
}

export function init(cli) {
  (new HelpCmd('help [command]', cli))
}
