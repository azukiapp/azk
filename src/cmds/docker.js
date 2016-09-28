import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { _, log, config, utils } from 'azk';
import { async } from 'azk/utils/promises';

export default class Docker extends CliTrackerController {
  index(opts) {
    return async(this, function* () {
      if (!config('agent:requires_vm')) {
        var args = _.map(opts['docker-args'], (arg) => arg.replace(/(["\\`])/g, "\\$1"));
        let cmd  = `/bin/sh -c 'docker "${args.join('" "')}"'`;
        log.debug("docker direct options: %s", cmd, {});
        return this.ui.execSh(cmd);
      } else {
        // Require agent is started
        yield Helpers.requireAgent(this.ui);

        // cmd
        let cmd = ["vm", "ssh"];

        // If is interactive mode force ssh tty
        if (this.ui.isInteractive()) {
          cmd.push("-t");
        }

        // init command
        cmd.push('--');

        // Move to current folder
        var point = config('agent:vm:mount_point');
        cmd.push("cd");
        cmd.push(utils.docker.resolvePath(this.cwd || '', point));
        cmd.push(" ;");

        // Adding escape arguments and mount docker command
        cmd.push("docker");
        cmd = [...cmd, ...opts['docker-args']];

        log.debug("docker vm options: %j", cmd, {});
        return this.runShellInternally(cmd);
      }
    });
  }
}
