import { Q, _, config, t, fs, path } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Client } from 'azk/agent/client';

class Cmd extends Command {
  action(opts) {
    var keys = ["agent", "status"];
    return (Client[opts.action](opts)).progress((event) => {
      if (event.running) {
        this.ok([...keys, event.type, "running"]);
      } else {
        this.fail([...keys, event.type, "not_running"]);
      }
    });
  }
}

export function init(cli) {
  (new Cmd('agent {action}', cli))
    .setOptions('action', { options: ['start', 'status', 'stop'] })
    .addOption(['--force_vm', '-f'], { default: false })
}
