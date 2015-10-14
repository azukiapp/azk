import { CliTrackerController } from 'azk/cli/cli_tracker_controller';
import { Helpers } from 'azk/cli/helpers';
import { _, config, lazy_require } from 'azk';
import { defer, asyncUnsubscribe } from 'azk/utils/promises';
import { subscribe } from 'azk/utils/postal';

var lazy = lazy_require({
  Manifest: ['azk/manifest'],
  docker  : ['azk/docker', 'default'],
});

class Shell extends CliTrackerController {
  index() {
    var { options } = this.normalized_params;
    var args = this.normalized_params.arguments;

    var _subscription = subscribe('docker.pull.status', (data) => {
      Helpers.newPullProgressBar(this.ui)(data);
    });

    return asyncUnsubscribe(this, _subscription, function* () {
      var dir = this.cwd;
      var manifest, system;

      yield Helpers.requireAgent(this.ui);

      if (options.image) {
        // Arbitrary image
        manifest = lazy.Manifest.makeFake(dir, options.image);
        system   = manifest.systemDefault;
      } else {
        manifest = new lazy.Manifest(dir, true);
        Helpers.manifestValidate(this.ui, manifest);

        system   = manifest.systemDefault;
        if (args.system) {
          system = manifest.system(args.system, true);
        }
      }

      if (_.isString(options.command)) {
        options.command = `${options.command};`;
      }
      var commands = _.compact([ options.command, ...args['shell-args']]);
      var tty_default = options.tty || _.isEmpty(commands);
      var tty = (options['no-tty']) ? (options.tty || false) : tty_default;

      var stdin = this.ui.stdin();
      stdin.custom_pipe = () => { };

      var cmd_options  = {
        interactive: tty,
        pull   : this.ui.stdout(),
        stdout : this.ui.stdout(),
        stderr : this.ui.stderr(),
        stdin  : stdin,
        workdir: options.cwd || null,
      };

      // Support extra envs, ports and mount volumes
      cmd_options.envs       = this._parse_option(options.env  , /.+=.+/, '=', 'invalid_env');
      cmd_options.shell_term = process.env.TERM;
      cmd_options.mounts = this._parse_option(options.mount, /.+:.+:?.*/, ':', 'invalid_mount', 1, (opts) => {
        return { type: (opts[2] ? opts[1] : 'path'), value: (opts[2] ? opts[2] : opts[0]) };
      });

      // TODO add support to `-- [shell-args]`
      var cmd = [options.shell || system.shell];
      if (!_.isEmpty(commands)) {
        cmd.push("-c");
        cmd.push(commands.join(' '));
      }
      cmd = _.compact(cmd);

      // Remove container before run
      var is_remove = !options['no-remove'] ? config("docker:remove_container") : !options['no-remove'];
      cmd_options = _.merge(cmd_options, {
        build_force    : options.rebuild || false,
        provision_force: (options.rebuild ? true : options.reprovision) || false,
        remove         : is_remove,
      });

      var result = defer((resolver, reject) => {
        var escape = (key, container, next) => {
          if (key === ".") {
            process.nextTick(() => {
              lazy.docker.getContainer(container).stop({ t: 5000 }).catch(reject);
            });
            return true;
          } else if (key === "?") {
            this.ok("coming soon...");
            process.nextTick(() => next());
            return true;
          }
          return false;
        };

        var _subscription_run = subscribe('docker.run.status', (data) => {
          this._escapeAndPullProgress(escape, system,
            !options.silent, options.verbose, options.stdout)(data);
        });

        system
          .runShell(cmd, cmd_options)
          .then(function (result) {
            _subscription_run.unsubscribe();
            return result;
          })
          .then(resolver, reject)
          .catch(function (err) {
            _subscription_run.unsubscribe();
            throw err;
          });
      });

      result = yield result.catch((error) => {
        return this.parseError(error);
      });

      return result.code;
    });
  }

  parseError(error) {
    if (error.statusCode) {
      if (error.statusCode === 404 && error.reason === "no such container") {
        this.ui.fail("commands.shell.ended.removed");
        return { code: 127 };
      }
    } else if (error.code === 'ECONNRESET') {
      this.ui.fail("commands.shell.ended.docker_end");
      return { code: 127 };
    } else if (error.code === 'ECONNREFUSED') {
      this.ui.fail("commands.shell.ended.docker_not_found");
      return { code: 127 };
    }
    throw error;
  }

  _escapeAndPullProgress(escape, system, show_logs, verbose) {
    return (event) => {
      var pullProgressBar = Helpers.newPullProgressBar(this.ui);
      var escapeCapture   = Helpers.escapeCapture(escape);

      // show verbose output
      if (verbose && event.stream) {
        this.ui.stdout().write('  ' + event.stream);
      }

      if (event.type === "stdin_pipe") {
        escapeCapture(event);
      } else if (show_logs) {
        if (show_logs && event.type === "pull_msg") {
          pullProgressBar(event);
        } else if (event.type === "action") {
          var keys = ["commands", "scale"];
          var actions = ["pull_image", "build_image"];

          if (actions.indexOf(event.action) > -1) {
            var data = { image: system.image.name };
            this.ui.ok([...keys].concat(event.action), data);
          }
        }
      }
    };
  }

  _parse_option(option, regex, split, fail, key_index = 0, format = null) {
    var result = {};
    for (var j = 0; j < option.length; j++) {
      var opt = option[j];
      if (opt.match(regex)) {
        opt = opt.split(split);
        result[opt[key_index]] = format ? format(opt) : opt[1];
      } else {
        this.ui.fail('commands.shell.' + fail, { value: opt });
        return 1;
      }
    }
    return result;
  }
}

module.exports = Shell;
