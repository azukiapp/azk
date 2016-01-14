import { CliController as RouterController } from 'cli-router';
import { _, log, config } from 'azk';
import { run as cli_run } from 'azk/cli';

export class CliController extends RouterController {
  constructor(...args) {
    super(...args);
    this._verbose_level = 0;
  }

  _configure(opts) {
    opts = _.merge({}, opts, (this.normalized_params && this.normalized_params.options));

    // Set verbose level
    if (opts.verbose) {
      this._verbose_level = opts.verbose;
    }

    // Set console log level
    if (opts.log) {
      log.setConsoleLevel(opts.log);
    }

    // Save quiet mode in ui
    if (opts.quiet && this.ui) {
      this.ui.setInteractive(false);
    }

    // Force no colors in output
    if (opts['no-color']) {
      this.ui.useColours(false);
    }

    this.ui.useColours(config('flags:force_color'));
  }

  isInteractive() {
    return this.ui && this.ui.isInteractive();
  }

  verbose() {
    return null;
  }

  verbose_msg(nivel, func, ...args) {
    if (nivel <= this._verbose_level) {
      if (typeof(func) == "function") {
        return func(...args);
      } else {
        return this.verbose(func, ...args);
      }
    }
  }

  // Callbacks
  run_action(action_name, opts, ...args) {
    let options = _.isObject(action_name) ? action_name : opts;
    this._configure(options);
    return super.run_action(action_name, opts, ...args);
  }

  runShellInternally(cmd) {
    var [, result] = cli_run(cmd, this.cwd, this.ui);
    return result;
  }
}
