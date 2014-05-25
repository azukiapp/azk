import { Q, _, config, t, fs, path } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Api } from 'azk/agent/api';

class Cmd extends Command {
  action(opts) {
    var api = new Api(this);
    return api[opts.action](opts);
  }
}

export function init(cli) {
  (new Cmd('agent {action}', cli))
    .setOptions('action', { options: ['start', 'status', 'stop'] })
    .addOption(['--force_vm', '-f'], { default: false })
}
