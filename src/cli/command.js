import { _ } from 'azk';
import { InvalidOptionError, RequiredOptionError } from 'azk/utils/errors';
import { Option } from 'azk/cli/option';
import { UIProxy, UI } from 'azk/cli/ui';

export { Option, UI };
export class Command extends UIProxy {
  constructor(name, user_interface) {
    this.stackable = [];
    this.commands  = {};
    this.options   = {};
    this.name      = this.__parse_name(name);

    // Parent or interface
    super(user_interface);
    if (this.parent) {
      this.parent.initChildren(this);
    }
  }

  initChildren(parent) { }

  __parse_name(name) {
    var names = name.split(' ');
    name = names.shift();

    _.each(names, (option) => {
      var type     = String;
      var stop     = option.match(/^[\[|\{]\*.*[\]|\}]$/) ? true : false;
      var name     = option.replace(/^[\[|\{]\*?(.*)[\]|\}]$/, "$1");
      var required = option.match(/^\{.*\}$/) ? true : false;
      this.stackable.push(new Option({name, type, required, stop}));
    });

    return name;
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

  run(args = [], opts = null) {
    return this.action(this.parse(args), opts);
  }

  action() {
    throw new Error("Don't use Command directly, implemente the action.");
  }
}
