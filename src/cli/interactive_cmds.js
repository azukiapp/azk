import { Command } from 'azk/cli/command';

export class InteractiveCmds extends Command {
  constructor(...args) {
    this._verbose_nivel = 0;
    this.non_interactive = false;

    super(...args);
    this.addOption(['--verbose', '-v'], { default: false, acc: true });
    this.addOption(['--quiet'  , '-q'], { default: false } )
  }

  before_action(opts, ...args) {
    this._verbose_nivel = opts.verbose;

    if (opts.quiet) {
      this.non_interactive = true;
    }

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
