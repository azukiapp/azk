import { Q, _, config, t } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import docker from 'azk/docker';

class ExecCmd extends Command {
  action(opts) {
    var self = this;
    return Q.async(function* () {
      var cmd = [opts.cmd, ...opts.__leftover];
      var dir = self.cwd;
      var env = {};

      // Get image
      if (opts.image) {
        var image = yield Helpers.pull_image(self, opts.image);
      }

      // Default volumes
      var volumes = { [dir]: "/azk/app" };

      // Container name
      var name = ".exec.";
      name += (opts.interactive ? 'interactive' : 'raw');

      var container = yield docker.run(image.name, cmd, {
        tty: opts.interactive ? self.stdout().isTTY : false,
        stdout: self.stdout(),
        stderr: self.stderr(),
        stdin: opts.interactive ? (self.stdin()) : null,
        volumes: volumes,
        working_dir: volumes[dir],
        env: env,
        ns: name,
      });

      var data = yield container.inspect();
      return data.State.ExitCode
    })();
  }
}

export function init(cli) {
  (new ExecCmd('exec {*cmd}', cli))
    .addOption(['--image', '-I'], { type: String })
    .addOption(['--interactive', '-i'])
}
