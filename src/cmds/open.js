import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { _, lazy_require } from 'azk';
import { async } from 'azk/utils/promises';

var lazy = lazy_require({
  open: 'open',
  Manifest: ['azk/manifest'],
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

      var instances = yield defaultSystem.instances({ type: "daemon" });
      if (instances.length > 0) {
        var hostname = defaultSystem.url;
        lazy.open(hostname, open_with);
        this.ui.ok('commands.open.success', {hostname: hostname});
      } else {
        var name = defaultSystem.name;
        this.ui.fail('commands.open.system_not_running', {name: name});
      }

      return 0;
    });
  }

}

module.exports = Open;
