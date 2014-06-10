"use strict";
var __moduleName = "src/cli/command";
var $__3 = require('azk'),
    _ = $__3._,
    t = $__3.t;
var $__3 = require('azk/utils/errors'),
    InvalidOptionError = $__3.InvalidOptionError,
    RequiredOptionError = $__3.RequiredOptionError,
    InvalidValueError = $__3.InvalidValueError;
var Option = require('azk/cli/option').Option;
var $__3 = require('azk/cli/ui'),
    UIProxy = $__3.UIProxy,
    UI = $__3.UI;
var Helpers = require('azk/cli/helpers').Helpers;
var printf = require('printf');
;
var Command = function Command(name, user_interface) {
  this.stackable = [];
  this.commands = {};
  this.options = {};
  this.name = this.__parse_name(name);
  this.__cwd = null;
  $traceurRuntime.superCall(this, $Command.prototype, "constructor", [user_interface]);
  if (this.parent) {
    this.parent.initChildren(this);
  }
};
var $Command = Command;
($traceurRuntime.createClass)(Command, {
  get cwd() {
    return (this.parent) ? this.parent.cwd : this.__cwd;
  },
  set cwd(value) {
    this.__cwd = value;
  },
  initChildren: function(parent) {},
  __parse_name: function(name) {
    var $__0 = this;
    var names = name.split(' ');
    name = names.shift();
    _.each(names, (function(option) {
      $__0.stackable.push(new Option({
        type: String,
        stop: option.match(/^[\[|\{]\*.*[\]|\}]$/) ? true : false,
        name: option.replace(/^[\[|\{]\*?(.*)[\]|\}]$/, "$1"),
        required: option.match(/^\{.*\}$/) ? true : false
      }));
    }));
    return name;
  },
  addOption: function(alias) {
    var options = arguments[1] !== (void 0) ? arguments[1] : {};
    var $__0 = this;
    alias = _.isArray(alias) ? alias : [alias];
    alias = _.map(alias, (function(alias) {
      return alias.replace(/^-*/, '');
    }));
    options.alias = alias;
    options.name = _.first(alias);
    var option = new Option(options);
    _.each(alias, (function(name) {
      return $__0.options[name] = option;
    }));
    return this;
  },
  setOptions: function(name) {
    var options = arguments[1] !== (void 0) ? arguments[1] : {};
    var option = _.find(this.stackable, (function(opt) {
      return opt.name == name;
    }));
    if (!option) {
      option = this.options[name];
    }
    if (option) {
      _.each(options, (function(value, key) {
        return option[key] = value;
      }));
    }
    return this;
  },
  fix_args: function(args) {
    return _.reduce(args, (function(memo, arg) {
      if (arg.match(/^-[^-]/)) {
        var args = _.map(arg.slice(1).split(''), (function(a) {
          return ("-" + a);
        }));
        memo = memo.concat(args);
      } else if (arg.match(/^-{2,}no-/)) {
        arg = arg.replace(/^-{2,}no-/, '');
        memo = memo.concat([("--" + arg), 'false']);
      } else if (arg.match(/^-{2,}.*=.*$/)) {
        memo = memo.concat(arg.split('='));
      } else {
        memo.push(arg);
      }
      return memo;
    }), []);
  },
  invalid_options: function(option) {
    throw new InvalidOptionError(option);
  },
  parse: function(args) {
    var $__0 = this;
    var opts = {};
    var save_value = (function(options, value) {
      if (_.isEmpty(value) && options.acc)
        return;
      if (options.acc) {
        var actual = opts[options.name] || [];
        actual.push(value);
        value = actual;
      }
      opts[options.name] = value;
    });
    _.each(this.options, (function(opt) {
      if (opt.haveDefault() && !_.has(opts, opt.name)) {
        opts[opt.name] = opt.default;
      }
    }));
    var $__3 = [null, null],
        previous = $__3[0],
        previous_value = $__3[1];
    var stackable = _.clone(this.stackable);
    var stop = false;
    var process = (function() {
      if (previous_value) {
        if (!previous) {
          previous = stackable.shift();
        }
        if (previous) {
          try {
            var value = previous.processValue(previous_value);
          } catch (err) {
            if (err instanceof InvalidValueError && stackable.length > 0 && !previous.required) {
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
          $__0.invalid_options(previous_value);
        }
      }
    });
    args = this.fix_args(args);
    while ((!stop) && args.length > 0) {
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
  },
  valid_requires: function(opts) {
    var filter = (function(opt) {
      return opt.required;
    });
    var requireds = _.filter(this.options, filter);
    requireds = requireds.concat(_.filter(this.stackable, filter));
    _.each(requireds, (function(option) {
      if (!opts[option.name])
        throw new RequiredOptionError(option.name);
    }));
  },
  run: function() {
    var args = arguments[0] !== (void 0) ? arguments[0] : [];
    var opts = arguments[1] !== (void 0) ? arguments[1] : null;
    return this.action(this.parse(args), opts);
  },
  action: function() {
    throw new Error("Don't use Command directly, implemente the action.");
  },
  tKeyPath: function() {
    for (var keys = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      keys[$__2] = arguments[$__2];
    return $traceurRuntime.spread(['commands', this.name], keys);
  },
  showUsage: function() {
    var prefix = arguments[0] !== (void 0) ? arguments[0] : null;
    this.__show_usage(prefix);
    this.__show_description();
    this.__show_options();
    this.__show_stackables();
  },
  usageLine: function() {
    var replace = arguments[0] !== (void 0) ? arguments[0] : null;
    var usage = [this.name];
    if (_.keys(this.options).length > 0) {
      usage.push('[options]');
    }
    _.each(this.stackable, (function(option) {
      if (replace == option.name) {
        usage.push("%s");
      } else {
        var r = option.required;
        var stop = option.stop ? '*' : '';
        usage.push((r ? '{' : '[') + stop + option.name + (r ? '}' : ']'));
      }
    }));
    return usage.join(" ");
  },
  __show_usage: function(prefix) {
    var usage = this.usageLine();
    if (prefix)
      usage = printf(prefix, usage);
    this.tOutput("commands.help.usage", usage);
  },
  __show_description: function() {
    this.output();
    this.tOutput(this.tKeyPath("description"));
  },
  __show_options: function() {
    var $__0 = this;
    if (_.keys(this.options).length > 0) {
      this.output();
      this.tOutput("commands.help.options");
      this.output();
      var rows = [];
      _.each(this.options, (function(opt, key) {
        if (key == opt.name) {
          rows.push(opt.help(t($__0.tKeyPath("options", opt.name))));
        }
      }));
      this.outputWithLabel(rows, '  ');
    }
  },
  __show_stackables: function() {
    var $__0 = this;
    _.each(this.stackable, (function(opt) {
      if (opt.options && opt.options.length > 0) {
        var tKey = $__0.tKeyPath("options", opt.name);
        $__0.output();
        $__0.output("%s:", t($traceurRuntime.spread(tKey, ["name"])) || opt.name);
        $__0.output();
        $__0.outputWithLabel(opt.helpValues($traceurRuntime.spread(tKey, ["options"])), '  ');
      }
    }));
  }
}, {}, UIProxy);
module.exports = {
  get Option() {
    return Option;
  },
  get UI() {
    return UI;
  },
  get Helpers() {
    return Helpers;
  },
  get Command() {
    return Command;
  },
  __esModule: true
};
//# sourceMappingURL=command.js.map