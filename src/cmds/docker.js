import { _, path, async, defer, config } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Manifest } from 'azk/manifest';

class Cmd extends Command {
  get docker() {
    return require('azk/docker').default;
  }

  run_docker(opts) {
    return defer((resolve, reject) => {
      var point = config('agent:vm:mount_point') + '.nfs';
      var _path = this.docker.resolvePath(this.cwd, point);
      var args  = _.reduce(opts.__leftover, (args, arg) => {
        args.push(`\\"${arg}\\"`);
        return args;
      }, []);
      var   cmd = `azk vm ssh -t "cd ${_path}; docker ${opts.dockerargs} ${args.join(" ")}"`;

      this.execSh(cmd, (err) => {
        resolve((err) ? err.code : 0);
      });
    });
  }

  action(opts) {
    return async(this, function* () {
      yield Helpers.requireAgent();
      return yield this.run_docker(opts);
    });
  }
}

export function init(cli) {
  return (new Cmd('docker [*dockerargs]', cli))
}

