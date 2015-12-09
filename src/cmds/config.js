import { _ } from 'azk';
import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { promiseResolve } from 'azk/utils/promises';
import { ConfigurationVoidValueError } from 'azk/utils/errors';
import Configuration from 'azk/configuration';

class Config extends CliTrackerController {
  constructor(...args) {
    super(...args);
    this.require_terms = false;
  }

  // list all configuration
  list(cmd) {
    let key_param = cmd['config-key'];
    let configuration = new Configuration();
    let configList = configuration.listAll();

    if (key_param) {
      configList = _.filter(configList, (item) => {
        return item.key === key_param;
      });
    }

    if (configList.length === 0) {
      this.ui.info('commands.config.key_not_found', {key: key_param});
    }

    let getLabel = (item) => {
      let getSufix = (type) => {
        if (type === 'boolean') {
          return ' [Y/N]'.grey;
        }
        if (type === 'string') {
          return ' [text]'.grey;
        }
        if (type === 'number') {
          return ' [number]'.grey;
        }
        return '';
      };
      return item.key.italic + getSufix(item.type) + ': ';
    };

    let getValue = (item) => {
      let value = item.value;
      if (typeof value === 'undefined' || value === null) {
        return 'null'.grey.bold;
      }
      if (value === true) {
        return 'Y'.green.bold;
      }
      if (value === false) {
        return 'N'.green.bold;
      }
      return value.bold;
    };

    _.each(configList, (configItem) => {
      let label = getLabel(configItem);
      let value = getValue(configItem);
      if (cmd.verbose >= configItem.verbose_level) {
        this.ui.output(`${label}${value}`);
      }
    });

    return promiseResolve(0);
  }

  // resets all configuration
  reset() {
    let configuration = new Configuration();
    return this.askConfirmation('commands.config.reset.ask_confirmation', false)
    .then((result) => {
      if (result) {
        configuration.resetAll();
        this.ui.ok('commands.config.reset.confirmed');
      }
      return promiseResolve(0);
    });
  }

  // set a configuration
  set(cmd) {
    let key_param = cmd['config-key'];
    let value_param = cmd['config-value'];
    let configuration = new Configuration();

    if (key_param && value_param) {
      // value exist
      let is_valid = configuration.validate(key_param, value_param);
      if (is_valid) {
        let converted_value = configuration.convertInputValue(key_param, value_param);
        configuration.save(key_param, converted_value);
        this.ui.ok('commands.config.set_ok', {
          key: key_param,
          value: converted_value,
        });
      }
      return promiseResolve(0);
    } else {
      let config_item;
      // get and validate key
      if (key_param) {
        config_item = configuration.getKey(key_param);
      }
      // no value, throw error
      if (!value_param) {
        throw new ConfigurationVoidValueError(key_param);
      }
    }
  }
}

module.exports = Config;
