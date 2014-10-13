import { _, fs, config, async, set_config, dynamic } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { AGENT_CODE_ERROR } from 'azk/utils/errors';

dynamic(this, {
  Client() {
    return require('azk/agent/client').Client;
  },

  Configure() {
    return require('azk/agent/configure').Configure;
  },
});

class Cmd extends Command {
  action(opts) {
    var progress = Helpers.vmStartProgress(this);

    return async(this, function* () {
      // Skip if not use a vm
      if (config('agent:requires_vm')) {
        // Remove and adding vm (to refresh vm configs)
        if (opts['reload-vm'] && opts.action == "start") {
          var cmd_vm = this.parent.commands.vm;
          yield cmd_vm.action({ action: 'remove', fail: () => {} });
        }
      }

      // Check and load configures
      var status = yield Client.status();
      if (opts.action == 'start' && !status.agent) {
        this.warning('status.agent.wait');
        var conf = new Configure(this);
        this.ok('configure.loading_checking');
        conf = yield conf.run();
        this.ok('configure.loaded');
      }

      // Call action in agent
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
