import { _, async, log, config, utils, lazy_require } from 'azk';
import { Command, Helpers } from 'azk/cli/command';

lazy_require(this, {
  Manifest() {
    return require('azk/manifest').Manifest;
  },
});

class Cmd extends Command {
  run_docker(opts) {
    return async(this, function* () {
      var args = _.map(process.argv.slice(3), (arg) => {
        return arg.match(/^.* .*$/) ? `\\"${arg}\\"` : arg;
      });

      if (!config('agent:requires_vm')) {
        var cmd   = `/bin/sh -c "docker ${args.join(" ")}"`;
      } else {
        // Require agent is started
        yield Helpers.requireAgent(this);

        var point = config('agent:vm:mount_point') + '.nfs';
        var _path = utils.docker.resolvePath(this.cwd, point);
        var cmd   = `azk vm ssh -t "cd ${_path}; docker ${args.join(" ")}" 2>/dev/null`;
      }

      log.debug("docker options: %s", cmd);
      return this.execSh(cmd);
    });
  }

  action(opts) {
    return async(this, function* () {
      if (config('agent:requires_vm')) {
        yield Helpers.requireAgent();
      }
      return yield this.run_docker(opts);
    });
  }
}

export function init(cli) {
  return (new Cmd('docker [*dockerargs]', cli))
}

