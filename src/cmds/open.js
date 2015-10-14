import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { _, lazy_require } from 'azk';
import { async } from 'azk/utils/promises';

var lazy = lazy_require({
  Manifest: ['azk/manifest'],
});

class Open extends CliTrackerController {
  index(opts) {
    return async(this, function* () {
      // Requirements
      yield Helpers.requireAgent(this.ui);
      var manifest = new lazy.Manifest(this.cwd, true);

      // Select system from options
      // or fallback to default system
      var system = (opts.system) ? manifest.getSystemsByName(opts.system)[0]
                                 : manifest.systemDefault;
      var system_name = system.name;

      // Verify for --open-with flag
      var open_with;
      if (opts['open-with'] && _.isString(opts['open-with']) ) {
        open_with = opts['open-with'];
      }

      // Verify is system has http ports
      if (system.balanceable) {
        // Verify if any instances running
        var instances = yield system.instances({ type: "daemon" });
        if (instances.length > 0) {
          var hostname = system.url;
          this.ui.open(hostname, open_with);
          this.ui.ok('commands.open.success', {hostname: hostname});
        } else {
          this.ui.fail('commands.open.system_not_running', {name: system_name});
        }
      } else {
        this.ui.fail('commands.start.option_errors.open.default_system_not_balanceable', {name: system_name});
      }

      return 0;
    });
  }

}

module.exports = Open;
