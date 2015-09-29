import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { _, lazy_require } from 'azk';
import { async } from 'azk/utils/promises';

var lazy = lazy_require({
  open: 'open',
  Manifest: ['azk/manifest'],
  prettyjson: 'prettyjson'
});

class Open extends CliTrackerController {
  index(opts) {
    return async(this, function* () {
      // Requirements
      yield Helpers.requireAgent(this.ui);
      var manifest = new lazy.Manifest(this.cwd, true);

      // Select default system
      var defaultSystem = manifest.systemDefault;

      // Verify for --open-with flag
      var open_with;
      if (opts['open-with'] && _.isString(opts['open-with']) ) {
          open_with = opts['open-with'];
        }
      }

      // Rescue system instances and test if any is running
      var instances = yield defaultSystem.instances({ type: "daemon" });
      if (instances.length > 0) {
        var hostname = defaultSystem.url;
        lazy.open(hostname, open_with);
        this.ui.success('commands.open.success', hostname);
      } else {
        this.ui.fail('commands.open.system_not_running', defaultSystem.name);
      }

      return 0;
    });
  }

  _format_command(commands) {
    commands = _.map(commands, (cmd) => {
      return (cmd.match(/\s/)) ? `"${cmd.replace(/\"/g, '\\"')}"` : cmd;
    });
    return commands.join(" ");
  }
}

module.exports = Open;
