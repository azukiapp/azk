import { Command } from 'azk/cli/command';

export class VerboseCmd extends Command {
  constructor(...args) {
    this._verbose_nivel = 0;
    super(...args);
    this.addOption(['--verbose', '-v'], { default: false, acc: true });
  }

  before_action(opts, ...args) {
    this._verbose_nivel = opts.verbose;
    return super(opts, ...args);
  }

  verbose(...args) {
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
