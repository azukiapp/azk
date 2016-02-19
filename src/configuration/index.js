import { _, config, isBlank } from 'azk';
import { meta as azkMeta } from 'azk';
import { ConfigurationInvalidValueRegexError, ConfigurationInvalidKeyError } from 'azk/utils/errors';

const NULL_REGEX = /^(null|undefined|none|blank|reset)$/i;

export class Configuration {
  constructor(opts) {
    this.opts = _.merge({
      namespace: config('configuration:namespace'),
    }, opts);

    const BOOLEAN_REGEX = /^(on|true|1|off|false|0|null|undefined|none|blank|reset)$/i;

    const BOOLEAN_CONVERSION_FUNC = (str_arg) => {
      if (typeof str_arg === 'undefined' || str_arg === null) {
        // was not informed
        return undefined;
      }

      str_arg = str_arg.toLowerCase(str_arg);

      // ex: "on"    -> true
      // ex: "1"     -> true
      // ex: "false" -> false
      // ex: "none"  -> null
      if (str_arg === 'on' ||
          str_arg === 'true' ||
          str_arg === '1') {
        return true;
      }

      if (str_arg === 'off' ||
          str_arg === 'false' ||
          str_arg === '0') {
        return false;
      }

      if (str_arg === 'null' ||
          str_arg === 'undefined' ||
          str_arg === 'none' ||
          str_arg === 'blank' ||
          str_arg === 'reset') {
        return null;
      }
    };

    // user can inform a null value to a string configuration
    const STRING_CONVERSION_FUNC = (str_arg) => {
      if (typeof str_arg === 'undefined' || str_arg === null) {
        // was not
        return undefined;
      }

      if (str_arg.toLowerCase() === 'null' ||
          str_arg.toLowerCase() === 'undefined' ||
          str_arg.toLowerCase() === 'none' ||
          str_arg.toLowerCase() === 'blank' ||
          str_arg.toLowerCase() === 'reset') {
        return null;
      }
      return str_arg;
    };

    // initial configuration
    this.opts._azk_config_list = [
      {
        key: 'user.email',
        type: 'string',
        validation_regex: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
        convertValidValueFunction: STRING_CONVERSION_FUNC,
        verbose_level: 0,
      },
      {
        key: 'user.email_always_ask',
        type: 'boolean',
        validation_regex: BOOLEAN_REGEX,
        convertValidValueFunction: BOOLEAN_CONVERSION_FUNC,
        verbose_level: 0,
      },
      {
        key: 'user.email_ask_count',
        type: 'number',
        verbose_level: 1,
      },
      {
        key: 'terms_of_use.accepted',
        type: 'boolean',
        validation_regex: BOOLEAN_REGEX,
        convertValidValueFunction: BOOLEAN_CONVERSION_FUNC,
        verbose_level: 0,
      },
      {
        key: 'terms_of_use.ask_count',
        type: 'number',
        verbose_level: 1,
      },
      {
        key: 'crash_reports.always_send',
        type: 'boolean',
        validation_regex: BOOLEAN_REGEX,
        convertValidValueFunction: BOOLEAN_CONVERSION_FUNC,
        verbose_level: 0,
      },
      {
        key: 'tracker_permission',
        type: 'boolean',
        validation_regex: BOOLEAN_REGEX,
        convertValidValueFunction: BOOLEAN_CONVERSION_FUNC,
        verbose_level: 0,
      },
    ];
  }

  _formatKey(key) {
    let ns = this.opts.namespace;
    return isBlank(ns) ? key : `${ns}.${key}`;
  }

  save(key, value) {
    azkMeta.set(this._formatKey(key), value);
  }

  load(key, default_value) {
    return azkMeta.get(this._formatKey(key), default_value);
  }

  remove(key) {
    return azkMeta.del(this._formatKey(key));
  }

  validate(key, value) {
    // key exists?
    let current_config = this.getKey(key);

    // inserting null/undefined/... value is valid
    let is_valid_null = NULL_REGEX.test(value);
    if (is_valid_null) {
      return true;
    }

    // valid regex value?
    let validation_regex = current_config.validation_regex;
    let value_exist = !isBlank(value);

    if (validation_regex && value_exist && !is_valid_null) {
      let is_value_valid = current_config.validation_regex.test(value);
      if (!is_value_valid) {
        throw new ConfigurationInvalidValueRegexError(key, value);
      }
    }

    return true;
  }

  getKey(key) {
    // key exists?
    let current_config = this.opts._azk_config_list.filter((item) => {
      return item.key === key;
    });
    if (current_config.length === 0) {
      throw new ConfigurationInvalidKeyError(key);
    }
    return current_config[0];
  }

  convertInputValue(key, value) {
    // get key
    let current_config = this.getKey(key);

    // convert
    let convertValidValueFunction = current_config.convertValidValueFunction;
    if (convertValidValueFunction) {
      return convertValidValueFunction(value);
    } else {
      return value;
    }
  }

  listAll() {
    let listWithValues = _.map(this.opts._azk_config_list, (item) => {
      item.value = this.load(item.key);
      return item;
    });
    return listWithValues;
  }

  getAll() {
    return this.opts._azk_config_list;
  }

  resetAll() {
    this.opts._azk_config_list.forEach((item) => {
      this.remove(item.key);
    });
    return true;
  }
}
