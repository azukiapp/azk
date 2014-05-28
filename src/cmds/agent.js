import { Q, _, config, set_config } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Client } from 'azk/agent/client';

var keys = ["commands", "agent", "status"];

class Cmd extends Command {
  progress(event) {
    if (event) {
      if (event.running) {
        this.ok([...keys, event.type, "running"]);
      } else {
        this.fail([...keys, event.type, "not_running"]);
      }
    }
  }

  action(opts) {
    // Force vm use?
    if (opts.force_vm) {
      set_config('agent:requires_vm', true);
    }

    var progress = (...args) => { this.progress(...args) };
    var result = (Client[opts.action](opts)).progress(progress);
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
    .addOption(['--force_vm', '-f'], { default: false })
}
