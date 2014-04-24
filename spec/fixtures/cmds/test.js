import { Command } from 'azk/cli/command';

export class TestOptions extends Command {
  action(opts) {
    this.dir(opts);
  }
}

export class TestSub extends TestOptions { }

export function init(cli) {
  (new TestOptions('test_options', cli))
    .addOption(['--number' , '-n'], { type: Number, desc: "Number description" })
    .addOption(['--verbose', '-v'], { desc: "Verbose description" })
    .addOption(['--flag'   , '-f'], { desc: "Flag description" })
    .addOption(['--size'], { options: ["small", "big"] });

  (new TestSub('test_sub {sub_command} [sub_command_opt]', cli))
    .addOption(['--string', '-s'], { required: true, type: String, desc: "String description" });
}
