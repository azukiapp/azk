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
    return this.trackStatus(...args).then(() => {
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
      return Helpers.askBugReportToggle(this.ui);
    })
    .then((result) => {
      var bugReportUtil = new BugReportUtil({});

      if (result === 1) {
        // ENABLE_CONFIG  = 1
        return bugReportUtil.saveBugReportUtilPermission(true);
      } else if (result === 2){
        // DISABLE_CONFIG = 2
        return bugReportUtil.saveBugReportUtilPermission(false);
      } else if (result === 3){
        // CLEAR_CONFIG   = 3
        return bugReportUtil.saveBugReportUtilPermission(undefined);
      }
    })
    .then(() => {
      return promiseResolve(0);
    });
  }

  // Email
  emailSet(...args) {
    var configuration = new Configuration({});
    return this.emailStatus(...args)
    .then(() => {
      return Helpers.askEmail(this.ui);
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

}

module.exports = Config;
