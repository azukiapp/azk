import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { _, log, config, utils } from 'azk';
import { async } from 'azk/utils/promises';

class Docker extends CliTrackerController {
  index(opts) {
    return async(this, function* () {
      var cmd, _path;
      var args = _.map(opts['docker-args'], (arg) => {
        return arg.replace(/'/g, "'\"'\"'");
      });

      if (!config('agent:requires_vm')) {
        args = _.map(args, (arg) => arg.match(/^.* .*$/) ? `"${arg}"` : arg);
        cmd  = `/bin/sh -c 'docker ${args.join(" ")}'`;
      } else {
        // Require agent is started
        yield Helpers.requireAgent(this.ui);
        var point = config('agent:vm:mount_point');
        _path = utils.docker.resolvePath(this.cwd || '', point);
        args  = _.map(args, (arg) => arg.match(/^.* .*$/) ? `\\"${arg}\\"` : arg);
        cmd   = `azk vm ssh -- 'cd ${_path}; docker ${args.join(" ")}'`;
      }

      log.debug("docker options: %s", cmd);
      return this.ui.execSh(cmd);
    });
  }
}

module.exports = Docker;
