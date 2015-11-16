import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { promiseResolve } from 'azk/utils/promises';
import { Helpers } from 'azk/cli/helpers';
import BugReportUtil from 'azk/configuration/bug_report';
import Configuration from 'azk/configuration';

class Config extends CliTrackerController {
  // Tracker
  trackStatus() {
    var status = this.ui.tracker.loadTrackerPermission();
    this.ui.ok('commands.config.tracking-' + status.toString());
    return promiseResolve(status);
  }

  trackToggle(...args) {
    return this._trackStatus(...args).then(() => {
      return Helpers.askPermissionToTrack(this.ui, true);
    });
  }

  // Bug Report
  bugReportStatus() {
    var bugReportUtil = new BugReportUtil({});
    var bugReport_status = bugReportUtil.loadBugReportUtilPermission();

    if (typeof bugReport_status === 'undefined') {
      this.ui.ok('commands.config.bugReport-undefined');
    } else {
      this.ui.ok('commands.config.bugReport-' + bugReport_status.toString());
    }

    return promiseResolve(0);
  }

  bugReportToggle(...args) {
    return this.bugReportStatus(...args)
    .then(() => {
      return Helpers.askBugReportEnableConfig(this.ui);
    });
  }

  // Email
  emailSet(...args) {
    var configuration = new Configuration({});

    return this.emailStatus(...args)
    .then(() => {
      return Helpers.askEmail(this.ui);
    })
    .then((prompt_result) => {
      /**/console.log('\n>>---------\n prompt_result:\n', prompt_result, '\n>>---------\n');/*-debug-*/
      var input_email = prompt_result.result;
      if (input_email.length === 0) {
        configuration.saveEmail(undefined);
        this.ui.ok('commands.config.email-reset-to-null');
        return promiseResolve(0);
      } else {
        var email_is_valid = /[^\\.\\s@][^\\s@]*(?!\\.)@[^\\.\\s@]+(?:\\.[^\\.\\s@]+)*/.test(input_email);
        if(!email_is_valid) {
          this.ui.ok('commands.config.email-not-valid', { email: input_email });
          return this.emailSet(input_email);
        } else {
          configuration.saveEmail(input_email);
          this.ui.ok('commands.config.email-reset-to-null');
          return promiseResolve(0);
        }
      }
    });
  }

  emailStatus() {
    var configuration = new Configuration({});
    var email = configuration.loadEmail();
    if (email) {
      this.ui.ok('commands.config.email-current', {email: email});
    } else {
      this.ui.ok('commands.config.email-undefined');
    }
    return promiseResolve(0);
  }

}

module.exports = Config;
