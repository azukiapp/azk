import { _, t } from 'azk';
import { InvalidValueError } from 'azk/utils/errors';

var boolean_opts = ['1', '0', 'false', 'true', false, true];

export class Option {
  constructor(opts) {
    _.merge(this, {
      show_default: true,
    }, opts);

    if (_.has(opts, 'default'))
      this._default = opts.default;
  }

  get default() {
    var value = this._default;

    // Boolean with acc
    if (this.type == Boolean && this.acc) {
      value = value ? 1 : 0;
    }

    return _.has(this, '_default') ? value : (
      this.type == Boolean ? false : null
    );
  }

  set default(value) {
    this._default = value;
  }

  haveDefault() {
    return _.has(this, "_default");
  }

  set type(value) {
    this._type = value;
  }

  get type() {
    return this._type || (_.isArray(this.options) ? String : Boolean);
  }

  help(desc) {
    if (this.hidden !== true) {
      // Names
      var names = _.reduce(this.alias, (names, alias) => {
        if (alias.length == 1) {
          names.push('-' + alias);
          if (this.acc) names.push('-' + alias + alias);
        } else {
          names.push('--' + alias);
        }
        return names;
      }, []);

      switch(this.type) {
        case String:
          if (this.default !== null || this.placeholder !== null) {
            names[0] += `="${this.default || this.placeholder}"`;
          }
          break;
        case Boolean:
          var default_value = this.default;
          if (this.show_default)
            if (default_value !== null) {
              desc += ` (default: ${default_value ? true : false})`;
            }
          break;
      }

      if (this.acc) {
        desc += " - multiples supported";
      }

      return [names.join(', '), desc].join('\t');
    } else {
      return "\t";
    }
  }

  helpValues(tKey) {
    var help = [];
    var hidden_options = this.hidden || [];

    _.each(this.options, (opt) => {
      if (!_.contains(hidden_options, opt)) {
        var desc = t(_.isObject(opt) ? ["commands", opt.name, "description"] : [...tKey, opt]);
        help.push(this.__optionName(opt) + '\t' + desc);
      }
    });

    return help;
  }

  __optionName(opt) {
    return _.isObject(opt) ? opt.name : opt;
  }

  processValue(value) {
    switch(this.type) {
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
}
