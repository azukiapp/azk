import { Q, _, config, set_config } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Client } from 'azk/agent/client';

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
        default:
          this.ok([...keys, "agent", event.status]);
      }
    }
  }

  action(opts) {
    var progress = (...args) => { this.progress(opts.action, ...args) };
    var result   = (Client[opts.action](opts)).progress(progress);

    // Results and fails
    if (opts.action == "start") {
      result = result.fail((err) => {
        this.fail("commands.agent.start_fail", err.stack);
        return Client.stop().progress(progress);
      });
    }

    return result;
  }
}

export function init(cli) {
  (new Cmd('agent {action}', cli))
    .setOptions('action', { options: ['start', 'status', 'stop'] })
    .addOption(['--daemon', '-d'], { default: false })
}
