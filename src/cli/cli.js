import { _, lazy_require } from 'azk';
import { Command, Option } from 'azk/cli/command';
import { InvalidValueError } from 'azk/utils/errors';

lazy_require(this, {
  glob: ['glob', 'sync'],
  path: 'path',
});

export { Command };
export class Cli extends Command {
  constructor(name, user_interface, cmds_cwd) {
    super(name, user_interface, cmds_cwd);

    // Load sub-commands
    if (cmds_cwd) {
      this.__load_cmds(cmds_cwd);
    }
  }

  initChildren(children) {
    this.addCmd(children);
  }

  __load_cmds(cwd) {
    var cmds = glob("*.js", { cwd: cwd });
    _.each(cmds, (cmd) => {
      require(path.join(cwd, cmd)).init(this);
    });
  }

  // External options
  addCmd(cmd) {
    var opt = _.find(this.stackable, (opt) => { return opt.name == 'command' });
    if (!opt) {
      opt = new Option({
        name: 'command', type: String, require: true, options: [], stop: true
      });
      this.stackable.push(opt);
    }
    opt.options.push(cmd);
    this.commands[cmd.name] = cmd;
  }

  showUsage(command = null) {
    if (!command) return super();

    var cmd = this.commands[command];
    if (!cmd)
      throw new InvalidValueError('command', command);

    // Show usage for command
    var prefix = this.usageLine("command");
    return cmd.showUsage(prefix);
  }

  action(opts, parent_opts) {
    var cmd = this.commands[opts.command];
    if (cmd && cmd instanceof Command) {
      return cmd.run(_.clone(opts.__leftover), opts);
    }
  }
}

