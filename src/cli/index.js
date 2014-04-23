import { _ } from 'azk';
import { sync as glob } from 'glob';

var path = require('path');

export class Command {
  constructor(name, user_interface, cmds_cwd) {
    this.name = name;
    this.subCommands = {};
    this.options = {};

    // Parent or interface
    if (user_interface instanceof Command) {
      this.parent = user_interface;
      this.parent.addCmd(name, this);
    } else {
      this.__user_interface = user_interface;
    }

    if (cmds_cwd) {
      this.load_cmds(cmds_cwd);
    }
  }

  //addAlias(name) {
    //if (this.parent) {
      //this.parent.addCmd(name, this);
    //}
  //}

  addCmd(name, cmd) {
    this.subCommands[name] = cmd;
  }

  run(args) {
    var cmd  = args.shift();
    var opts = this.subCommands[cmd].parse(args);
    this.subCommands[cmd].action(opts);
  }

  fix_args(args) {
    return _.reduce(args, (memo, arg) => {
      // Split simple args (-afx => -a -f -x)
      if (arg.match(/^-[^-]/)) {
        var args = _.map(arg.slice(1).split(''), (a) => { return `-${a}` });
        memo = memo.concat(args);

      // No options (--no-debug => --debug false )
      } else if (arg.match(/^--no-/)) {
        arg  = arg.replace(/^--no-/, '');
        memo = memo.concat([`--${arg}`, 'false']);
      } else {
        memo.push(arg)
      }
      return memo;
    }, []);
  }

  invalidOptions(arg) {
    throw new Error(`Invalid option ${arg}`);
  }

  process_option(opt, value) {
    switch(opt.type) {
      case Number:
        return value.match(/^-?[\d|.|,]*$/) ? Number(value) : null;
    }
  }

  default_value(opt) {
    return _.has(opt, 'default') ? opt.default : (
      (opt.type || Boolean) == Boolean ? true : null
    )
  }

  parse(args) {
    var opts = {};
    var previous = null;
    var previous_value = null;

    _.each(this.fix_args(args), (arg) => {
      var is_opt = arg.match(/^-{1,}/);

      // Save previous
      if (is_opt && previous_value) {
        opts[previous.name] = this.process_option(previous, previous_value);
        previous_value = previous = null;
      }

      if (is_opt) {
        arg = arg.replace(/^-*/, '');
        if (this.options[arg]) {
          previous = this.options[arg];
          opts[previous.name] = this.default_value(previous);
        } else {
          this.invalidOptions(arg);
        }
      } else {
        previous_value = arg;
      }
    });

    return opts;
  }

  addOption(alias, options) {
    alias = _.isArray(alias) ? alias : [alias];
    alias = _.map(alias, (alias) => alias.replace(/^-*/, ''));
    options.name = _.first(alias);
    _.each(alias, (name) => this.options[name] = options);
    return this;
  }

  load_cmds(cwd) {
    var cmds = glob("*.js", { cwd: cwd });
    _.each(cmds, (cmd) => {
      require(path.join(cwd, cmd)).init(this);
    });
  }

  // Outputs and debugs
  dir(data) {
    this.userInterface.dir(data);
  }

  get userInterface() {
    return this.parent ? this.parent.userInterface : this.__user_interface;
  }
}
