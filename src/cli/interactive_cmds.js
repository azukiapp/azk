import { TrackedCmds } from 'azk/cli/tracked_cmds';

export class InteractiveCmds extends TrackedCmds {
  constructor(...args) {
    super(...args);

    this._verbose_nivel = 0;
    this.non_interactive = false;

    this.addOption(['--verbose', '-v'], { default: false, acc: true });
    this.addOption(['--quiet'  , '-q'], { default: false } );
  }

  before_action(opts, ...args) {
    this._verbose_nivel = opts.verbose;

    if (opts.quiet) {
      this.non_interactive = true;
    }

    return super.before_action(opts, ...args);
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
