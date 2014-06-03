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
      var progress = Helpers.newPullProgress(self);

      if (opts.image) {
        // Arbitrary image
        var manifest = Manifest.makeFake(dir, opts.image);
        var system   = manifest.systemDefault;
      } else {
        var manifest = new Manifest(dir);
        if (!manifest.file) {
          self.fail('manifest.not_found');
          return 1;
        }

        if (opts.system) {
          var system = manifest.system(opts.system);
          if (!system) {
            var systems = _.map(manifest.systems, (_, name) => {
              return name
            }).join(',');
            self.fail('commands.exec.system_not', {
              system: opts.system,
              systems: systems
            });
            return 1;
          }
        } else {
          var system = manifest.systemDefault;
        }
      }

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
    .addOption(['--system', '-s'], { type: String })
    .addOption(['--image', '-I'], { type: String })
    .addOption(['--interactive', '-i'])
}
