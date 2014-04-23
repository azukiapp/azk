import { Command as Cli } from 'azk/cli';

export class Command extends Cli {
  action(opts, ui) {
    this.dir(opts);
  }
}

export function init(cli) {
  (new Command('test', cli))
    .addOption(['--number' , '-n'], { type: Number, desc: "Number description" })
    .addOption(['--verbose', '-v'], { desc: "Verbose description" })
    .addOption(['--flag'   , '-f'], { desc: "Flag description" })
}
