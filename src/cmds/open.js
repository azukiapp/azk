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
      var system = manifest.systemDefault;

      // Verify if system is up
      var instances = yield system.instances({ type: "daemon" });
      var hostname;

      // Verify for --open-with flag
      var open_with;
      if (opts['open-with'] && _.isString(opts['open-with']) ) {
          open_with = opts['open-with'];
        }
      }

      // System is up when 'instances' is not empty
      if (instances.length > 0) {
        hostname = system.url.underline;
        console.log('System is up:', hostname);
        // Open nav
        lazy.open(system.url, open_with);
      } else {
        hostname = system.hostname;
        console.log('System is down:', hostname);
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
