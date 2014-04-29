import { _ } from 'azk';
import { sync as glob } from 'glob';
import { Command, Option } from 'azk/cli/command';

var path = require('path');

export { Command };
export class Cli extends Command {
  constructor(name, user_interface, cmds_cwd) {
    super(name, user_interface, cmds_cwd);

    // Load sub-commands
    if (cmds_cwd) {
      this.__load_cmds(cmds_cwd);
    }
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
    opt.options.push(cmd.name);
    this.commands[cmd.name] = cmd;
  }

  action(opts, parent_opts) {
    var cmd = this.commands[opts.command];
    if (cmd && cmd instanceof Command) {
      cmd.run(_.clone(opts.__leftover), opts);
    }
  }
}

