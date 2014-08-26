import { _, fs, config, async, set_config } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { AGENT_CODE_ERROR } from 'azk/utils/errors';
import { VM  }   from 'azk/agent/vm';

var net = require('net');

class Cmd extends Command {
  action(opts) {
    var Client   = require('azk/agent/client').Client;
    var progress = Helpers.vmStartProgress(this);

    return async(this, function* () {
      if (opts['reload-vm'] && opts.action == "start") {
        var cmd_vm = this.parent.commands.vm;
        yield cmd_vm.action({ action: 'remove', fail: () => {} });
      }

      var promise = Client[opts.action](opts).progress(progress);
      return promise.then((result) => {
        if (opts.action != "status") return result;
        return (result.agent) ? 0 : 1;
      });
    });
  }
}

export function init(cli) {
  var cli = (new Cmd('agent {action}', cli))
    .setOptions('action', { options: ['start', 'status', 'stop'] })
    .addOption(['--daemon', '-d'], { default: true });

  if (config('agent:requires_vm')) {
    cli.addOption(['--reload-vm', '-d'], { default: true });
  }
}
