import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { _, log, config, utils } from 'azk';
import { async } from 'azk/utils/promises';

export default class Docker extends CliTrackerController {
  index(opts) {
    return async(this, function* () {
      var cmd;
      var args = _.map(opts['docker-args'], (arg) => {
        return arg.replace(/'/g, "'\"'\"'");
      });

      if (!config('agent:requires_vm')) {
        args = _.map(args, (arg) => arg.match(/^.* .*$/) ? `"${arg}"` : arg);
        cmd  = `/bin/sh -c 'docker ${args.join(" ")}'`;
        log.debug("docker direct options: %s", cmd);
        return this.ui.execSh(cmd);
      } else {
        // Require agent is started
        yield Helpers.requireAgent(this.ui);

        // If is interactive mode force ssh tty
        var ssh_args = [];
        if (this.ui.isInteractive()) {
          ssh_args.push("-t");
        }

        // Move to current folder
        var point = config('agent:vm:mount_point');
        ssh_args.push(`cd ${utils.docker.resolvePath(this.cwd || '', point)};`);

        // Adding escape arguments and mount docker command
        args  = _.map(args, (arg) => arg.match(/^.* .*$/) ? `\\"${arg}\\"` : arg);
        ssh_args.push(`docker ${args.join(" ")}`);

        cmd = ["vm", "ssh", "--", ...ssh_args];
        log.debug("docker vm options: %j", cmd);

        return this.runShellInternally(cmd);
      }
    });
  }
}
