import { _, config, t, async } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Manifest } from 'azk/manifest';

class Cmd extends Command {
  action(opts) {
    var progress = Helpers.newPullProgress(this);

    return async(this, function* () {
      var cmd = [opts.cmd, ...opts.__leftover];
      var dir = this.cwd;
      var env = {};

      if (opts.image) {
        // Arbitrary image
        var manifest = Manifest.makeFake(dir, opts.image);
        var system   = manifest.systemDefault;
      } else {
        var manifest = new Manifest(dir, true);
        var system   = manifest.systemDefault;
        if (opts.system) system = manifest.system(opts.system, true);
      }

      var options  = {
        pull: this.stdout().isTTY ? true : cmd.stdout(),
        interactive: opts.interactive,
        stdout: this.stdout(),
        stderr: this.stderr(),
        stdin: this.stdin(),
      }

      if (!opts['skip-provision']) {
        yield system.provision({ force_provision: opts.reprovision });
      }
      return yield system.exec(cmd, options);
    }).progress(progress);
  }
}

export function init(cli) {
  (new Cmd('exec {*cmd}', cli))
    .addOption(['--system', '-s'], { type: String })
    .addOption(['--image', '-I'], { type: String })
    .addOption(['--interactive', '-i'])
    .addOption(['--reprovision', '-r'], { default: false })
    .addOption(['--skip-provision', '-S'], { default: false })
}
