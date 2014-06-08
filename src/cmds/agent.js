import { Q, _, config, set_config } from 'azk';
import { Command, Helpers } from 'azk/cli/command';

class Cmd extends Command {
  action(opts) {
    var Client   = require('azk/agent/client').Client;
    var progress = Helpers.vmStartProgress(this);
    return Client[opts.action](opts).progress(progress);
  }
}

export function init(cli) {
  (new Cmd('agent {action}', cli))
    .setOptions('action', { options: ['start', 'status', 'stop'] })
    .addOption(['--daemon', '-d'], { default: false })
}
