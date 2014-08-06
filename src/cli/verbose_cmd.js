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

  verbose_msg(nivel, ...args) {
    if (nivel <= this._verbose_nivel) {
      return this.verbose(...args);
    }
  }
}
