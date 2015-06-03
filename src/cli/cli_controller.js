import { CliController as RouterController } from 'cli-router';

export class CliController extends RouterController {
  constructor(...args) {
    super(...args);
    this._verbose_nivel = 0;
    this.non_interactive = false;
  }

  before_action(action_name, opts, ...args) {
    this._verbose_nivel = opts.verbose;

    if (opts.quiet) {
      this.non_interactive = true;
    }

    return super.before_action(action_name, opts, ...args);
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
}
