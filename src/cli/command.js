import { _ } from 'azk';
import { sync as glob } from 'glob';
import {
  InvalidOptionError,
  InvalidValueError,
  RequiredOptionError
} from 'azk/utils/errors';

var path = require('path');
var boolean_opts = ['1', '0', 'false', 'true', false, true];

class Option {
  constructor(opts) {
    this.name     = opts.name;
    this.desc     = opts.desc;
    this.alias    = opts.alias;
    this._type    = opts.type;
    this.required = opts.required;
    this.options  = opts.options;
    this.stop     = opts.stop;

    if (_.has(opts, 'default'))
      this._default = opts.default;
  }

  get default() {
    return _.has(this, '_default') ? this._default : (
      this.type == Boolean ? true : null
    )
  }

  set default(value) {
    this._default = value;
  }

  set type(value) {
    this._type = value;
  }

  get type() {
    return this._type || (_.isArray(this.options) ? String : Boolean);
  }

  processValue(value) {
    switch(this.type) {
      case String:
        if (_.isArray(this.options) && !_.contains(this.options, value)) {
          throw new InvalidValueError(this.name, value);
        }
        return value;
      case Number:
        return value.match(/^-?[\d|.|,]*$/) ? Number(value) : null;
      default:
        if (!_.contains(boolean_opts, value))
          throw new InvalidValueError(this.name, value);
        return (value == "true" || value == 1) ? true : false;
    }
  }
}

export class Command {
  constructor(name, user_interface, cmds_cwd) {
    this.stackable = [];
    this.commands  = {};
    this.options   = {};
    this.name      = this.__parse_name(name);

    // Parent or interface
    if (user_interface instanceof Command) {
      this.parent = user_interface;
      this.parent.addCmd(this);
    } else {
      this.__user_interface = user_interface;
    }

    // Load sub-commands
    if (cmds_cwd) {
      this.__load_cmds(cmds_cwd);
    }
  }

  __parse_name(name) {
    var names = name.split(' ');
    name = names.shift();

    _.each(names, (option) => {
      var type     = String;
      var name     = option.replace(/^[\[|\{](.*)[\]|\}]$/, "$1");
      var required = option.match(/^\{.*\}$/) ? true : false;
      this.stackable.push(new Option({name, type, required}));
    });

    return name;
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
      opt = new Option({ name: 'command', type: String, require: true, options: [], stop: true });
      this.stackable.push(opt);
    }
    opt.options.push(cmd.name);
    this.commands[cmd.name] = cmd;
  }

  addOption(alias, options) {
    alias = _.isArray(alias) ? alias : [alias];
    alias = _.map(alias, (alias) => alias.replace(/^-*/, ''));
    options.name = _.first(alias);
    _.each(alias, (name) => this.options[name] = new Option(options));
    return this;
  }

  // Parse and execute
  fix_args(args) {
    return _.reduce(args, (memo, arg) => {
      // Split simple args (-afx => -a -f -x)
      if (arg.match(/^-[^-]/)) {
        var args = _.map(arg.slice(1).split(''), (a) => { return `-${a}` });
        memo = memo.concat(args);

      // No options (--no-debug => --debug false )
      } else if (arg.match(/^-{2,}no-/)) {
        arg  = arg.replace(/^-{2,}no-/, '');
        memo = memo.concat([`--${arg}`, 'false']);

      // Key value option ( --debug=false )
      } else if (arg.match(/^-{2,}.*=.*$/)) {
        memo = memo.concat(arg.split('='));
      } else {
        memo.push(arg)
      }
      return memo;
    }, []);
  }

  invalid_options(option) {
    throw new InvalidOptionError(option);
  }

  parse(args) {
    var opts = {};
    var [previous, previous_value] = [null, null];
    var stackable = _.clone(this.stackable);
    var stop = false;

    var process = () => {
      if (previous_value) {
        if (!previous) {
          previous = stackable.shift();
        }

        if (previous) {
          opts[previous.name] = previous.processValue(previous_value);
          stop = previous.stop;
          previous_value = previous = null;
        } else {
          this.invalid_options(previous_value);
        }
      }
    }

    args = this.fix_args(args);
    while((!stop) && args.length > 0) {
      var arg = args.shift();
      if (arg.match(/^-{1,}/)) {
        arg = arg.replace(/^-*/, '');
        if (this.options[arg]) {
          previous = this.options[arg];
          opts[previous.name] = previous.default;
        } else {
          this.invalid_options(arg);
        }
      } else {
        previous_value = arg;
      }
      process();
    }

    this.valid_requires(opts);
    opts.__leftover = args;
    return opts;
  }

  valid_requires(opts) {
    var filter = (opt) => { return opt.required };
    var requireds = _.filter(this.options, filter);
    requireds = requireds.concat(_.filter(this.stackable, filter));

    _.each(requireds, (option) => {
      if (!opts[option.name])
        throw new RequiredOptionError(option.name);
    })
  }

  run(args, opts = null) {
    this.action(this.parse(args), opts);
  }

  action(opts, parent_opts) {
    var cmd = this.commands[opts.command];
    if (cmd && cmd instanceof Command) {
      cmd.run(_.clone(opts.__leftover), opts);
    }
  }

  // Outputs and debugs
  get userInterface() {
    return this.parent ? this.parent.userInterface : this.__user_interface;
  }

  dir(...data) {
    this.userInterface.dir(...data);
  }
}
