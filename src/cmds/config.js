import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { promiseResolve } from 'azk/utils/promises';
import { Helpers } from 'azk/cli/helpers';
import BugReportUtil from 'azk/configuration/bug_report';
import Configuration from 'azk/configuration';

class Config extends CliTrackerController {

  list(cmd) {
    let value_param = cmd['config-value'];
    let configuration = new Configuration({});
    let configList = configuration.listAll();
    let result = configList;

    if (value_param) {
      result = configuration.show(configList, value_param);
    }

    // Show result
    var inspect_result = require('util').inspect(result, { showHidden: false, depth: null, colors: cmd['no-colored'] === false });
    this.ui.output(inspect_result);

    return promiseResolve(0);
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
        return Helpers.askPermissionToTrack(this.ui, true);
      });
    } else {
      // user does informed a value
      initial_promise = promiseResolve(boolean_parsed);
    }

    return initial_promise
    .then((result) => {
      this.ui.tracker.saveTrackerPermission(result);
      return this.ui.tracker.sendEvent("tracker", { event_type: "accepted" });
    })
    .then(() => {
      return this.trackStatus(cmd);
    });
  }

  // Bug Report
  bugReportStatus() {
    var bugReportUtil = new BugReportUtil({});
    var bugReport_status = bugReportUtil.loadBugReportUtilPermission();

    if (bugReport_status === null || typeof bugReport_status === 'undefined') {
      this.ui.ok('commands.config.bugReport-undefined');
    } else {
      this.ui.ok('commands.config.bugReport-' + bugReport_status.toString());
    }

    return promiseResolve(0);
  }

  bugReportToggle(cmd) {
    let boolean_argument = cmd['config-value'];
    let boolean_parsed = Helpers.checkBooleanArgument(boolean_argument);
    let initial_promise;
    if (typeof boolean_parsed === 'undefined') {
      // user does not informed a value
      initial_promise = this.bugReportStatus(cmd)
      .then(() => {
        return Helpers.askBugReportToggle(this.ui);
      });
    } else {
      // user does informed a value
      initial_promise = promiseResolve(boolean_parsed);
    }

    return initial_promise
    .then((result) => {
      var bugReportUtil = new BugReportUtil({});
      return bugReportUtil.saveBugReportUtilPermission(result);
    })
    .then(() => {
      return this.bugReportStatus(cmd);
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
      configuration.saveEmail(email);
      return promiseResolve(0);
    });
  }

  emailStatus() {
    var configuration = new Configuration({});
    var email = configuration.loadEmail();
    if (email) {
      this.ui.ok('commands.config.email-current', { email: email });
    } else {
      this.ui.ok('commands.config.email-undefined');
    }
    return promiseResolve(0);
  }

  emailNeverAskStatus() {
    var configuration = new Configuration({});
    var value = configuration.loadEmailNeverAsk();

    if (typeof value === 'undefined') {
      value = 'undefined';
    }
    this.ui.ok('bugReport.email.never_ask_status', { value: value });

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
        return Helpers.askEmailNeverAsk(this.ui);
      });
    } else {
      // user does informed a value
      initial_promise = promiseResolve(boolean_parsed);
    }

    return initial_promise
    .then((result) => {
      var configuration = new Configuration({});
      return configuration.saveEmailNeverAsk(result);
    })
    .then(() => {
      return this.emailNeverAskStatus(cmd);
    });
  }
}

module.exports = Config;
