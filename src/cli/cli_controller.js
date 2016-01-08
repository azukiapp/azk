import { CliController as RouterController } from 'cli-router';
import { _, log, config } from 'azk';

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

    // Set colors on output (default true)
    let output_colors_by_param = opts['no-color'] !== 1;
    let config_output_color = (config('flags:use_colored_output') === true);
    let use_colors = output_colors_by_param && config_output_color;
    this.ui.setColors(use_colors);
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
}
