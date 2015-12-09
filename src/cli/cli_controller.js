import { CliController as RouterController } from 'cli-router';
import { _, log } from 'azk';

export class CliController extends RouterController {
  constructor(...args) {
    super(...args);
    this._verbose_nivel = 0;
  }

  configure(opts) {
    opts = _.merge({}, opts, (this.normalized_params && this.normalized_params.options))

    // Set log level
    if (opts.verbose) {
      this._verbose_nivel = opts.verbose;
    }
    if (opts.log) {
      log.setConsoleLevel(opts.log);
    }

    if (opts.quiet && this.ui) {
      this.ui.setInteractive(false);
    }
  }

  isInteractive() {
    return this.ui && this.ui.isInteractive();
  }

  verbose() {
    return null;
  }

  verbose_msg(nivel, func, ...args) {
    if (nivel <= this._verbose_nivel) {
      if (typeof(func) == "function") {
        return func(...args);
      } else {
        return this.verbose(func, ...args);
      }
    }
  }

  /*
    Callbacks
   */
  before_action(action_name, opts, ...args) {
    return super.before_action(action_name, opts, ...args);
  }

  run_action(action_name, opts, ...args) {
    var options = _.isObject(action_name) ? action_name : opts;
    this.configure(_.isObject(action_name) ? action_name : opts);
    return super.run_action(action_name, opts, ...args);
  }
}
