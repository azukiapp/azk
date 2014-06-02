import { Q, _, config, t } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Manifest } from 'azk/manifest';

class ExecCmd extends Command {
  action(opts) {
    var self = this;
    return Q.async(function* () {
      var cmd = [opts.cmd, ...opts.__leftover];
      var dir = self.cwd;
      var env = {};

      // Get image
      var progress = Helpers.newPullProgress(self);
      var manifest = Manifest.makeFake(dir, opts.image);
      var system   = manifest.systemDefault;
      var options  = {
        pull: self.stdout().isTTY ? true : cmd.stdout(),
        interactive: opts.interactive,
        stdout: self.stdout(),
        stderr: self.stderr(),
        stdin: self.stdin(),
      }

      return system.exec(cmd, options).progress(progress);
    })();
  }
}

export function init(cli) {
  (new ExecCmd('exec {*cmd}', cli))
    .addOption(['--image', '-I'], { type: String })
    .addOption(['--interactive', '-i'])
}
