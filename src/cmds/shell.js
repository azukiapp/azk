import { _, t, async, defer, lazy_require } from 'azk';
import { InteractiveCmds } from 'azk/cli/interactive_cmds';
import { Helpers } from 'azk/cli/command';

/* global Manifest, docker */
lazy_require(this, {
  Manifest() {
    return require('azk/manifest').Manifest;
  },

  docker() {
    return require('azk/docker').default;
  }
});

class Cmd extends InteractiveCmds {
  action(opts) {
    var progress = Helpers.newPullProgress(this);

    return async(this, function* () {
      var cmd = [opts.cmd, ...opts.__leftover];
      var dir = this.cwd;
      var manifest, system;

      yield Helpers.requireAgent(this);

      if (opts.image) {
        // Arbitrary image
        manifest = Manifest.makeFake(dir, opts.image);
        system   = manifest.systemDefault;
      } else {
        manifest = new Manifest(dir, true);
        Helpers.manifestValidate(this, manifest);

        system   = manifest.systemDefault;
        if (opts.system) {
          system = manifest.system(opts.system, true);
        }
      }

      var tty_default = opts.t || !_.isString(opts.command);
      var tty = (opts.T) ? (opts.t || false) : tty_default;

      var stdin = this.stdin();
      stdin.custom_pipe = () => { };

      var options  = {
        interactive: tty,
        pull   : this.stdout(),
        stdout : this.stdout(),
        stderr : this.stderr(),
        stdin  : stdin,
        workdir: opts.cwd || null,
      };

      // Support extra envs, ports and mount volumes
      options.envs   = this._parse_option(opts.env  , /.+=.+/, '=', 'invalid_env');
      options.mounts = this._parse_option(opts.mount, /.+:.+:?.*/, ':', 'invalid_mount', (opts) => {
        return { type: (opts[2] ? opts[1] : 'path'), value: (opts[2] ? opts[2] : opts[1]) };
      });

      cmd = [opts.shell || system.shell];
      if (opts.command) {
        cmd.push("-c");
        cmd.push(opts.command);
      }

      // Remove container before run
      options.remove = opts.remove;

      var result = defer((resolver, reject) => {
        var escape = (key, container) => {
          if (key === ".") {
            process.nextTick(() => {
              docker.getContainer(container).stop({ t: 5000 }).fail(reject);
            });
            return true;
          }
          return false;
        };

        var shell_progress = this._escapeAndPullProgress(escape, system, !opts.silent);

        system.runShell(cmd, options).
          progress(shell_progress).
          then(resolver, reject);
      });

      result = yield result.fail((error) => {
        return this.parseError(error);
      });

      return result.code;
    }).progress(progress);
  }

  parseError(error) {
    if (error.statusCode) {
      if (error.statusCode === 404 && error.reason === "no such container") {
        this.fail("commands.shell.ended.removed");
        return { code: 127 };
      }
    } else if (error.code === 'ECONNRESET') {
      this.fail("commands.shell.ended.docker_end");
      return { code: 127 };
    } else if (error.code === 'ECONNREFUSED') {
      this.fail("commands.shell.ended.docker_not_found");
      return { code: 127 };
    }
    throw error;
  }

  _escapeAndPullProgress(escape, system, show_logs) {
    return (event) => {
      var pull_progress = Helpers.newPullProgress(this);
      var escape_progress = Helpers.escapeCapture(escape);

      if (event.type === "stdin_pipe") {
        escape_progress(event);
      } else if (show_logs) {
        if (show_logs && event.type === "pull_msg") {
          pull_progress(event);
        } else if (event.type === "action") {
          var keys = ["commands", "scale"];

          if (event.action == "pull_image") {
            var data = { image: system.image.name };
            this.ok([...keys].concat(event.action), data);
          }
        }
      }
    };
  }

  _parse_option(option, regex, split, fail, format = null) {
    var result = {};
    for (var j = 0; j < option.length; j++) {
      var opt = option[j];
      if (opt.match(regex)) {
        opt = opt.split(split);
        result[opt[0]] = format ? format(opt) : opt[1];
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
    .addOption(['--remove', '--rm', '-r'], { default: true })
    .addOption(['--image', '-i'], { type: String })
    .addOption(['--command', '-c'], { type: String })
    .addOption(['--shell'], { type: String })
    .addOption(['--cwd', '-C'], { type: String })
    .addOption(['--mount', '-m'], { type: String, acc: true, default: [] })
    .addOption(['--env', '-e'], { type: String, acc: true, default: [] })
    .addOption(['--verbose', '-v'])
    .addOption(['--silent'])
    .addExamples(t("commands.shell.examples"))
  ;
}
