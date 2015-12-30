import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { lazy_require, _ } from 'azk';
import { async, promiseReject } from 'azk/utils/promises';
import { AzkError } from 'azk/utils/errors';
import { Helpers } from 'azk/cli/helpers';
import { run as cli_run } from 'azk/cli';

var lazy = lazy_require({
  Manifest: ['azk/manifest']
});

class Deploy extends CliTrackerController {
  index() {
    return async(this, function* () {
      yield Helpers.requireAgent(this.ui);

      // Get deploy [commands] avaible
      var output  = [];
      var mock_ui = { output: (line) => output.push(line) };
      cli_run(["deploy", "--help"], this.cwd, mock_ui);
      var args = output.join("").match(/Actions:([^]*)Arguments/)[0];
      args = _.map(args.match(/^\s{2}([\w|-]*)/mg), (arg) => arg.trim());

      var params   = this.normalized_params;
      var system   = this._getDeploySystem(this.cwd);
      var command  = _.find(args, (cmd) => params.commands[cmd]);
      var cmd_head = ["shell", system.name];
      var cmd_tail = [];

      // Rollback to version
      if (!_.isEmpty(params.arguments.ref)) {
        cmd_tail.push(params.arguments.ref);
      }

      // Forwarding shell and ssh commands
      if (params.commands.shell || params.commands.ssh) {
        if (!_.isEmpty(params.options.command)) {
          cmd_tail.push("-c", this._escape_quotes(params.options.command));
        } else if (!_.isEmpty(params.arguments.args)) {
          var escape_args = _.map(params.arguments.args, (arg) => this._escape_quotes(arg));
          cmd_tail.push(...escape_args);
        } else {
          cmd_head.push("--tty");
        }
      }

      // Call internaly cli and return result
      return this.runShell(cmd_head.concat(["--", command, ...cmd_tail]));
    })
    .catch((err) => {
      if (err instanceof AzkError) {
        this.ui.fail(err.toString());
      }
      return promiseReject(err);
    });
  }

  runShell(cmd) {
    var [, result] = cli_run(cmd, this.cwd, this.ui);
    return result;
  }

  _escape_quotes(cmd) {
    return cmd.replace(/"/g, `\\"`);
  }

  _getDeploySystem(cwd) {
    var manifest = new lazy.Manifest(cwd, true);
    return manifest.system("deploy", true);
  }
}

module.exports = Deploy;
