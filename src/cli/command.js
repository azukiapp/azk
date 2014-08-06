import { _, t } from 'azk';
import { InvalidOptionError, RequiredOptionError, InvalidValueError } from 'azk/utils/errors';
import { Option } from 'azk/cli/option';
import { UIProxy, UI } from 'azk/cli/ui';
import { Helpers } from 'azk/cli/helpers';

var printf = require('printf');

export { Option, UI, Helpers };
export class Command extends UIProxy {
  constructor(name, user_interface) {
    this.stackable = [];
    this.commands  = {};
    this.options   = {};
    this.name      = this.__parse_name(name);
    this.__cwd     = null;
    this.examples  = [];

    // Parent or interface
    super(user_interface);
    if (this.parent) {
      this.parent.initChildren(this);
    }
  }

  get cwd() {
    return (this.parent) ? this.parent.cwd : this.__cwd;
  }

  set cwd(value) {
    this.__cwd = value;
  }

  initChildren(parent) { }

  __parse_name(name) {
    var names = name.split(' ');
    name = names.shift();

    _.each(names, (option) => {
      this.stackable.push(new Option({
        type     : String,
        stop     : option.match(/^[\[|\{]\*.*[\]|\}]$/) ? true : false,
        name     : option.replace(/^[\[|\{]\*?(.*)[\]|\}]$/, "$1"),
        required : option.match(/^\{.*\}$/) ? true : false,
      }));
    });

    return name;
  }

  addExamples(examples) {
    this.examples = this.examples.concat(examples);
  }

  addOption(alias, options = {}) {
    alias = _.isArray(alias) ? alias : [alias];
    alias = _.map(alias, (alias) => alias.replace(/^-*/, ''));
    options.alias = alias;
    options.name  = _.first(alias);

    var option = new Option(options);
    _.each(alias, (name) => this.options[name] = option);

    return this;
  }

  setOptions(name, options = {}) {
    var option = _.find(this.stackable, (opt) => opt.name == name);
    if (!option) {
      option = this.options[name];
    }

    if (option) {
      _.each(options, (value, key) => option[key] = value);
    }

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

    // Check is acc
    var save_value = (options, value) => {
      if (options.type == Boolean && options.acc) {
        value = opts[options.name] || 0;
        value = (value === true ? 1 : value) + 1;
      } else {
        if (_.isEmpty(value) && options.acc) return;

        if (options.acc) {
          var actual = opts[options.name] || [];
          actual.push(value);
          value = actual;
        }
      }
      opts[options.name] = value;
    }

    // Set a default values
    _.each(this.options, (opt) => {
      if (opt.haveDefault() && !_.has(opts, opt.name)) {
        opts[opt.name] = opt.default;
      }
    });

    var [previous, previous_value] = [null, null];
    var stackable = _.clone(this.stackable);
    var stop = false;

    // Process values and save in opts
    var process = () => {
      if (previous_value) {
        // Not have a previos options then it is a stackable option
        if (!previous) {
          previous = stackable.shift();
        }

        if (previous) {
          try {
            var value = previous.processValue(previous_value);
          } catch (err) {
            if (
              err instanceof InvalidValueError
              && stackable.length > 0
              && !previous.required
            ) {
              if (previous.type == Boolean) {
                save_value(previous, true);
              }
              previous = null;
              return process();
            }
            throw err;
          }
          save_value(previous, value);
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
          save_value(previous, (previous.type == Boolean) ? true : previous.default);
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

  before_action(...args) {
    return this.action(...args);
  }

  run(args = [], opts = null) {
    return this.before_action(this.parse(args), opts);
  }

  action() {
    throw new Error("Don't use Command directly, implemente the action.");
  }

  tKeyPath(...keys) {
    return ['commands', this.name, ...keys];
  }

  showUsage(prefix = null) {
    this.__show_usage(prefix);
    this.__show_description();
    this.__show_options();
    this.__show_stackables();
    this.__show_examples();
    this.output();
  }

  usageLine(replace = null) {
    var usage = [this.name];

    if (_.keys(this.options).length > 0) {
      usage.push('[options]');
    }

    _.each(this.stackable, (option) => {
      if (replace == option.name) {
        usage.push("%s");
      } else {
        var r    = option.required;
        var stop = option.stop ? '*' : '';
        usage.push((r ? '{' : '[') + stop + option.name + (r ? '}' : ']'));
      }
    });

    return usage.join(" ");
  }

  __show_examples() {
    if (!_.isEmpty(this.examples)) {
      this.output();
      this.tOutput("commands.help.examples");
      this.output();
      _.each(this.examples, (example) => {
        this.output(`  ${example}`);
      });
    }
  }

  __show_usage(prefix) {
    var usage = this.usageLine();

    if (prefix)
      usage = printf(prefix, usage);

    this.tOutput("commands.help.usage", usage);
  }

  __show_description() {
    this.output();
    this.tOutput(this.tKeyPath("description"));
  }

  __show_options() {
    if (_.keys(this.options).length > 0) {
      this.output();
      this.tOutput("commands.help.options");
      this.output();
      var rows = [];
      _.each(this.options, (opt, key) => {
        // Skip alias
        if (key == opt.name) {
          rows.push(opt.help(t(this.tKeyPath("options", opt.name))));
        }
      });
      this.outputWithLabel(rows, '  ');
    }
  }

  __show_stackables() {
    _.each(this.stackable, (opt) => {
      if (opt.options && opt.options.length > 0) {
        var tKey = this.tKeyPath("options", opt.name);
        this.output();
        this.output("%s:", t([...tKey, "name"]) || opt.name);
        this.output();
        this.outputWithLabel(opt.helpValues([...tKey, "options"]), '  ');
      }
    });
  }
}
