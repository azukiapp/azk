import { _, config, t, async } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Manifest } from 'azk/manifest';

class Cmd extends Command {
  action(opts, extras) {
    var progress = Helpers.newPullProgress(this);

    return async(this, function* () {
      var cmd = [opts.cmd, ...opts.__leftover];
      var dir = this.cwd;
      var env = {};

      yield Helpers.requireAgent();

      if (opts.image) {
        // Arbitrary image
        var manifest = Manifest.makeFake(dir, opts.image);
        var system   = manifest.systemDefault;
      } else {
        var manifest = new Manifest(dir, true);
        var system   = manifest.systemDefault;
        if (opts.system) system = manifest.system(opts.system, true);
      }

      var tty_default = opts.t || !_.isString(opts.command)
      var tty = (opts.T) ? (opts.t || false) : tty_default;

      var options  = {
        interactive: tty,
        pull  : this.stdout(),
        stdout: this.stdout(),
        stderr: this.stderr(),
        stdin : this.stdin(),
      }

      var cmd = [opts.shell];
      if (opts.command) {
        cmd.push("-c");
        cmd.push(opts.command);
      }

      return yield system.exec(cmd, options);
    }).progress(progress);
  }
}

export function init(cli) {
  (new Cmd('shell', cli))
    .addOption(['-T'])
    .addOption(['-t'])
    .addOption(['--system', '-s'], { type: String })
    .addOption(['--image', '-i'], { type: String })
    .addOption(['--command', '-c'], { type: String })
    .addOption(['--shell'], { default: "/bin/sh", type: String })
    .addOption(['--verbose', '-v'])
}
