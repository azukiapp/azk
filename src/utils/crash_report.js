import { _, config, log, lazy_require } from 'azk';
import { isBlank } from 'azk/utils';
import { promiseResolve } from 'azk/utils/promises';

var lazy = lazy_require({
  Configuration    : ['azk/configuration'],
  CrashReportSender: 'crash-report-sender',
});

export class CrashReport {
  constructor(extra_values, tracker, configuration = null) {
    extra_values = _.merge({}, {
      meta: {},
      server: {},
    }, extra_values);

    if (tracker && tracker.meta) {
      if (tracker.meta.device_info) {
        extra_values.server = tracker.meta.device_info;
      }
      if (tracker.meta.agent_session_id) {
        extra_values.meta.agent_session_id = tracker.meta.agent_session_id;
      }
      if (tracker.meta.command_id) {
        extra_values.meta.command_id = tracker.meta.command_id;
      }
      if (tracker.meta.user_id) {
        extra_values.meta.user_id = tracker.meta.user_id;
      }
      if (tracker.meta.azk_version) {
        extra_values.meta.azk_version = tracker.meta.azk_version;
      }
    }

    this._configuration = configuration;
    this.extra_values = extra_values;
  }

  get configuration() {
    if (isBlank(this._configuration)) {
      this._configuration = new lazy.Configuration();
    }
    return this._configuration;
  }

  isEnable() {
    return !config('report:disable') && this.loadCrashReportAlwaysSend();
  }

  sendError(error, bug_sender = null) {
    if (!this.isEnable()) {
      log.debug(`[crash-report] bug report disabled`);
      return promiseResolve(false);
    }

    if (isBlank(bug_sender)) {
      bug_sender = new lazy.CrashReportSender({}, { logger: log, error_level: 'info' });
    }

    // make sender options
    let options = this.optionsToSend(error);

    return bug_sender.send(options)
    .timeout(4000)
    .then((result) => {
      log.debug(`[crash-report] bug report send to ${options.url}. result bellow:`);
      log.debug(result);
      return true;
    })
    .catch((err_result) => {
      log.debug(`[crash-report] error sending bug report to ${options.url}. error below:`);
      log.debug(err_result);
      return false;
    });
  }

  optionsToSend(error) {
    // Clone extra_values to protect object
    let extra_values = _.clone(this.extra_values);

    // get user email
    extra_values.person = {
      // Required: id
      // A string up to 40 characters identifying this user in your system.
      "id": this.configuration.load('tracker_user_id'),
      // Optional: email
      // A string up to 255 characters
      "email": this.configuration.load('user.email')
    };

    return {
      err            : error,
      extra_values   : extra_values,
      url            : config('report:url'),
      background_send: true,
      jsonWrapper    : (payload) => { return { report: payload }; },
    };
  }

  saveCrashReportAlwaysSend(response_bool) {
    return this.configuration.save('crash_reports.always_send', response_bool);
  }

  loadCrashReportAlwaysSend() {
    return this.configuration.load('crash_reports.always_send', true);
  }
}
