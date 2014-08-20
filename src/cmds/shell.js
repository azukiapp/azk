import { _, path, config, t, async } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Manifest } from 'azk/manifest';
import docker from 'azk/docker';

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
        pull   : this.stdout(),
        stdout : this.stdout(),
        stderr : this.stderr(),
        stdin  : this.stdin(),
        workdir: opts.cwd || null,
      }

      // Support extra envs, ports and mount volumes
      options.envs    = this._parse_option(opts.env  , /.*=.*/, '=', 'invalid_env');
      options.volumes = this._parse_option(opts.mount, /.*=.*/, '=', 'invalid_mount');

      var cmd = [opts.shell || system.shell];
      if (opts.command) {
        cmd.push("-c");
        cmd.push(opts.command);
      }

      // Remove container before run
      options.remove == opts.remove;
      return yield system.runShell(cmd, options);
    }).progress(progress);
  }

  _parse_option(option, regex, split, fail) {
    var result = {};
    for(var j = 0; j < option.length; j++) {
      var opt = option[j];
      if (opt.match(regex)) {
        opt = opt.split('=');
        result[opt[0]] = opt[1];
      } else {
        this.fail('commands.shell.' + fail, { value: opt });
        return 1;
      }
    }
    return result;
  }
}

export function init(cli) {
  (new Cmd('shell [system]', cli))
    .addOption(['-T'])
    .addOption(['-t'])
    .addOption(['--rm', '-r'], { default: true })
    .addOption(['--image', '-i'], { type: String })
    .addOption(['--command', '-c'], { type: String })
    .addOption(['--shell'], { type: String })
    .addOption(['--cwd', '-C'], { type: String })
    .addOption(['--mount', '-m'], { type: String, acc: true, default: [] })
    .addOption(['--env', '-e'], { type: String, acc: true, default: [] })
    .addOption(['--verbose', '-v'])
    .addExamples(t("commands.shell.examples"))
}
