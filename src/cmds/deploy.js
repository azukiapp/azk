import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { lazy_require } from 'azk';
import { defer, async } from 'azk/utils/promises';
import { AzkError } from 'azk/utils/errors';
import { Helpers } from 'azk/cli/helpers';

var lazy = lazy_require({
  Manifest: ['azk/manifest']
});

class Deploy extends CliTrackerController {
  index() {
    return async(this, function* () {
      yield Helpers.requireAgent(this.ui);

      return this
        ._getDeploySystem()
        .then(() => {
          return 0;
        })
        .catch((err) => {
          if (err instanceof AzkError) {
            this.ui.fail(err.toString());
          } else {
            this.ui.fail(err.stack);
          }
          return 1;
        });
    });
  }

  _getDeploySystem() {
    return defer((resolve) => {
      var manifest = new lazy.Manifest(this.cwd, true);
      resolve(manifest.getSystemsByName("deploy"));
    });
  }
}

module.exports = Deploy;
