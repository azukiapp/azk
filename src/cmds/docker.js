import { _, path, async, defer, log, config, utils } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Manifest } from 'azk/manifest';

class Cmd extends Command {
  get docker() {
    return require('azk/docker').default;
  }

  run_docker(opts) {
    return defer((resolve, reject) => {
      var args = _.map(process.argv.slice(3), (arg) => {
        return arg.match(/^.* .*$/) ? `\\"${arg}\\"` : arg;
      });

      if (!config('agent:requires_vm')) {
        var cmd   = `/bin/sh -c "docker ${args.join(" ")}"`;
      } else {
        var point = config('agent:vm:mount_point') + '.nfs';
        var _path = utils.docker.resolvePath(this.cwd, point);
        var cmd   = `azk vm ssh -t "cd ${_path}; docker ${args.join(" ")}"`;
      }

      log.debug("docker options: %s", cmd);
      this.execSh(cmd, (err) => {
        resolve((err) ? err.code : 0);
      });
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

