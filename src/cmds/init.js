import { Q, _, config, t, fs, path } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import docker from 'azk/docker';

class InitCmd extends Command {
  action(opts) {
    console.log(opts);

    var manifest = config("manifest");
    var cwd  = opts.path || this.parent.cwd;
    var file = path.join(cwd, manifest);

    if (fs.existsSync(file) && !opts.force) {
      this.fail(this.tKeyPath("already"), manifest);
      return 1;
    }

    //console.log(path);
    return 0;
  }
}

export function init(cli) {
  (new InitCmd('init [path]', cli))
    .addOption(['--force', '-f'], { default: false })
}

