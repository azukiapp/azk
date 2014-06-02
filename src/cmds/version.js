import { Command } from 'azk/cli/command';
import Azk from 'azk';

class HelpCmd extends Command {
  action(opts) {
    this.output("Azk %s", Azk.version);
    return 0;
  }
}

export function init(cli) {
  (new HelpCmd('version', cli))
}
