"use strict";
var __moduleName = "src/cli/option";
var $__2 = require('azk'),
    _ = $__2._,
    t = $__2.t;
var InvalidValueError = require('azk/utils/errors').InvalidValueError;
var boolean_opts = ['1', '0', 'false', 'true', false, true];
var Option = function Option(opts) {
  _.merge(this, {show_default: true}, opts);
  if (_.has(opts, 'default'))
    this._default = opts.default;
};
($traceurRuntime.createClass)(Option, {
  get default() {
    var value = this._default;
    if (this.type == Boolean && this.acc) {
      value = value ? 1 : 0;
    }
    return _.has(this, '_default') ? value : (this.type == Boolean ? false : null);
  },
  set default(value) {
    this._default = value;
  },
  haveDefault: function() {
    return _.has(this, "_default");
  },
  set type(value) {
    this._type = value;
  },
  get type() {
    return this._type || (_.isArray(this.options) ? String : Boolean);
  },
  help: function(desc) {
    var $__0 = this;
    var help = [];
    var names = _.reduce(this.alias, (function(names, alias) {
      if (alias.length == 1) {
        names.push('-' + alias);
        if ($__0.acc)
          names.push('-' + alias + alias);
      } else {
        names.push('--' + alias);
      }
      return names;
    }), []);
    switch (this.type) {
      case String:
        names[0] += ("=\"" + (this.default != null ? this.default : '') + "\"");
        break;
      case Boolean:
        if (this.show_default)
          var value = this.default;
        if (value != null) {
          desc += (" (default: " + (value ? true : false) + ")");
        }
        break;
    }
    if (this.acc) {
      desc += " - multiples supported";
    }
    return [names.join(', '), desc].join('\t');
  },
  helpValues: function(tKey) {
    var $__0 = this;
    var help = [];
    _.each(this.options, (function(opt) {
      var desc = t(_.isObject(opt) ? ["commands", opt.name, "description"] : $traceurRuntime.spread(tKey, [opt]));
      help.push($__0.__optionName(opt) + '\t' + desc);
    }));
    return help;
  },
  __optionName: function(opt) {
    return _.isObject(opt) ? opt.name : opt;
  },
  processValue: function(value) {
    switch (this.type) {
      case String:
        if (_.isArray(this.options)) {
          var options = _.map(this.options, this.__optionName);
          if (!_.contains(options, value)) {
            throw new InvalidValueError(this.name, value);
          }
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
}, {});
module.exports = {
  get Option() {
    return Option;
  },
  __esModule: true
};
//# sourceMappingURL=option.js.map