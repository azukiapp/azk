import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { lazy_require, _ } from 'azk';
import { async } from 'azk/utils/promises';
import { AzkError } from 'azk/utils/errors';
import { Helpers } from 'azk/cli/helpers';

var lazy = lazy_require({
  Manifest: ['azk/manifest']
});

class Deploy extends CliTrackerController {
  index() {
    return async(this, function* () {
      yield Helpers.requireAgent(this.ui);

      var system = this._getDeploySystem(this.cwd);
      var suffix = this.args.slice(1);
      var cmd = [`azk shell ${system.name}`];
      if (suffix) {
        if (_.contains(suffix, "shell") || _.contains(suffix, "ssh")) {
          if (_.contains(suffix, "--"))
            suffix = _.filter(suffix, (s) => s != '--')
          else {
            cmd.push("--tty");
          }
        }
        cmd.push('--');
        cmd.push(suffix.join(' '));
      }
      cmd = cmd.join(" ");

      return this._run(cmd);
    })
    .catch((err) => {
      if (err instanceof AzkError) {
        this.ui.fail(err.toString());
      } else {
        this.ui.fail(err.stack);
      }
      return 1;
    });
  }

  _run(cmd) {
    return this.ui.execSh(cmd);
  }

  _getDeploySystem(cwd) {
    var manifest = new lazy.Manifest(cwd, true);
    return manifest.system("deploy", true);
  }
}

module.exports = Deploy;
