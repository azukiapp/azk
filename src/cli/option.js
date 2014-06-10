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
    return _.has(this, '_default') ? this._default : (
      this.type == Boolean ? true : null
    )
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
    var help = [];
    // Names
    var names = _.map(this.alias, (alias) => {
      return ((alias.length > 1) ? '--' : '-') + alias;
    });

    switch(this.type) {
      case String:
        names[0] += `="${this.default != null ? this.default : ''}"`;
        break;
      case Boolean:
        if (this.show_default)
          desc += ` (default: ${this.default})`;
        break;
    }

    if (this.acc) {
      desc += " - multiples supported"
    }

    return [names.join(', '), desc].join('\t');
  }

  helpValues(tKey) {
    var help = [];

    _.each(this.options, (opt) => {
      var desc = t(_.isObject(opt) ? ["commands", opt.name, "description"] : [...tKey, opt]);
      help.push(this.__optionName(opt) + '\t' + desc);
    });

    return help;
  }

  __optionName(opt) {
    return _.isObject(opt) ? opt.name : opt
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
