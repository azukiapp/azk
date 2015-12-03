import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { promiseResolve } from 'azk/utils/promises';
import { Helpers } from 'azk/cli/helpers';
import CrashReportUtil from 'azk/configuration/crash_report';
import Configuration from 'azk/configuration';

class Config extends CliTrackerController {

  // list all configuration
  list(cmd) {
    let value_param = cmd['config-value'];
    let configuration = new Configuration({});
    let configList = configuration.listAll();
    let result = configList;

    if (value_param) {
      result = configuration.show(value_param);
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
    let configuration = new Configuration({});
    return Helpers.askConfirmation(this.ui, 'commands.config.reset.ask_confirmation', false)
    .then((result) => {
      if (result) {
        configuration.resetAll();
        this.ui.ok('commands.config.reset.confirmed');
      }
      return promiseResolve(0);
    });
  }

  // Tracker
  trackStatus() {
    var status = this.ui.tracker.loadTrackerPermission();

    if (status === null || typeof status === 'undefined') {
      this.ui.ok('commands.config.tracking-undefined');
    } else {
      this.ui.ok('commands.config.tracking-' + status.toString());
    }

    return promiseResolve(0);
  }

  trackToggle(cmd) {
    let boolean_argument = cmd['config-value'];
    let boolean_parsed = Helpers.checkBooleanArgument(boolean_argument);
    let initial_promise;
    if (typeof boolean_parsed === 'undefined') {
      // user does not informed a value
      initial_promise = this.trackStatus(cmd)
      .then(() => {
        return Helpers.askConfirmation(this.ui, 'tracker.question');
      });
    } else {
      // user does informed a value
      initial_promise = promiseResolve(boolean_parsed);
    }

    return initial_promise
    .then((result) => {
      this.ui.tracker.saveTrackerPermission(result);
    /**/console.log('\n%% '+ __filename +' \n');/*-debug-*/
      return this.ui.tracker.sendEvent("tracker", { event_type: "accepted" });
    })
    .then(() => {
      return this.trackStatus(cmd);
    });
  }

  // Bug Report
  crashReportStatus() {
    var crashReportUtil = new CrashReportUtil({});
    var crashReport_status = crashReportUtil.loadCrashReportAlwaysSend();

    if (crashReport_status === null || typeof crashReport_status === 'undefined') {
      this.ui.ok('commands.config.crashReport-undefined');
    } else {
      this.ui.ok('commands.config.crashReport-' + crashReport_status.toString());
    }

    return promiseResolve(0);
  }

  crashReportToggle(cmd) {
    let boolean_argument = cmd['config-value'];
    let boolean_parsed = Helpers.checkBooleanArgument(boolean_argument);
    let initial_promise;
    if (typeof boolean_parsed === 'undefined') {
      // user does not informed a value
      initial_promise = this.crashReportStatus(cmd)
      .then(() => {
        return Helpers.askCrashReportToggle(this.ui);
      });
    } else {
      // user does informed a value
      initial_promise = promiseResolve(boolean_parsed);
    }

    return initial_promise
    .then((result) => {
      var crashReportUtil = new CrashReportUtil({});
      return crashReportUtil.saveCrashReportAlwaysSend(result);
    })
    .then(() => {
      return this.crashReportStatus(cmd);
    });
  }

  // Email
  emailSet(cmd) {
    var email_input = cmd['config-value'];
    var configuration = new Configuration({});
    return this.emailStatus(cmd)
    .then(() => {
      return Helpers.askEmail(this.ui, email_input);
    })
    .then((email) => {
      configuration.save('user.email.ask_count', 0);
      configuration.save('user.email', email);
      return promiseResolve(0);
    });
  }

  emailStatus() {
    var configuration = new Configuration({});
    var email = configuration.load('user.email');
    if (email) {
      this.ui.ok('commands.config.email-current', { email: email });
    } else {
      this.ui.ok('commands.config.email-undefined');
    }
    return promiseResolve(0);
  }

  emailNeverAskStatus() {
    var configuration = new Configuration({});
    var value = configuration.load('user.email.never_ask');

    if (typeof value === 'undefined') {
      value = 'undefined';
    }
    this.ui.ok('crashReport.email.never_ask_status', { value: value });

    return promiseResolve(0);
  }

  emailNeverAskToggle(cmd) {
    let boolean_argument = cmd['config-value'];
    let boolean_parsed = Helpers.checkBooleanArgument(boolean_argument);
    let initial_promise;
    if (typeof boolean_parsed === 'undefined') {
      // user does not informed a value
      initial_promise = this.emailNeverAskStatus()
      .then(() => {
        return Helpers.askEmailEverytime(this.ui);
      });
    } else {
      // user does informed a value
      initial_promise = promiseResolve(boolean_parsed);
    }

    return initial_promise
    .then((always_ask_email) => {
      var configuration = new Configuration({});
      configuration.save('user.email.ask_count', 0);
      configuration.save('user.email.never_ask', !always_ask_email); // because ask to always send
    })
    .then(() => {
      return this.emailNeverAskStatus(cmd);
    });
  }
}

module.exports = Config;
