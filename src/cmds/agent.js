import { Q, _, config, set_config } from 'azk';
import { Command, Helpers } from 'azk/cli/command';

var keys = ["commands", "agent", "status"];

class Cmd extends Command {
  progress(action, event) {
    if (event) {
      // running, starting, not_running, already
      switch(event.status) {
        case "not_running":
        case "already":
          this.fail([...keys, "agent", event.status]);
          break;
        case "error":
          this.fail([...keys, "agent", event.status], event);
          break;
        default:
          this.ok([...keys, "agent", event.status]);
      }
    }
  }

  action(opts) {
    var Client   = require('azk/agent/client').Client;
    return Client[opts.action](opts).progress((...args) => {
      this.progress(opts.action, ...args)
    });
  }
}

export function init(cli) {
  (new Cmd('agent {action}', cli))
    .setOptions('action', { options: ['start', 'status', 'stop'] })
    .addOption(['--daemon', '-d'], { default: false })
}
