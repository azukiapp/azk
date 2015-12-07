import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { promiseResolve } from 'azk/utils/promises';
import { Helpers } from 'azk/cli/helpers';
import CrashReportUtil from 'azk/configuration/crash_report';
import Configuration from 'azk/configuration';

class Config extends CliTrackerController {

  // list all configuration
  list(cmd) {
    let key_param = cmd['config-key'];
    let configuration = new Configuration();
    let configList = configuration.listAll();
    let result = configList;

    if (key_param) {
      result = configuration.show(key_param);
    }

    // Show result
    let inspect = require('util').inspect;
    var inspect_result = inspect(result, {
      showHidden: false,
      depth: null,
      colors: cmd['no-colored'] === false
    });
    this.ui.output(inspect_result);

    return promiseResolve(0);
  }

  // resets all configuration
  reset() {
    let configuration = new Configuration();
    return Helpers.askConfirmation(this.ui, 'commands.config.reset.ask_confirmation', false)
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

    if (value_param) {
      // value exist
      let is_valid = configuration.validate(key_param, value_param);
      if(is_valid){
        let converted_value = configuration.convertInputValue(key_param, value_param);
        configuration.save(key_param, converted_value);
        this.ui.ok('commands.config.set-ok', {
          key: key_param,
          value: converted_value,
        });
      }
      return promiseResolve(0);
    } else {
      // ask for user input
      this.ui.ok('commands.config.will_ask');
      return promiseResolve(0);
    }
  }
}

module.exports = Config;
