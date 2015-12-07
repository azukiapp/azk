import { _, config, log, lazy_require } from 'azk';
import { meta as azkMeta } from 'azk';
import Configuration from 'azk/configuration';

var lazy = lazy_require({
  'CrashReportSender': 'crash-report-sender',
});

module.exports = class CrashReportUtil {
  constructor(opts, tracker) {
    opts = _.merge({}, {
      meta: {},
      server: {},
    }, opts);

    if (tracker && tracker.meta) {
      if (tracker.meta.device_info) {
        opts.server = tracker.meta.device_info;
      }
      if (tracker.meta.agent_session_id) {
        opts.meta.agent_session_id = tracker.meta.agent_session_id;
      }
      if (tracker.meta.command_id) {
        opts.meta.command_id = tracker.meta.command_id;
      }
      if (tracker.meta.user_id) {
        opts.meta.user_id = tracker.meta.user_id;
      }
      if (tracker.meta.azk_version) {
        opts.meta.azk_version = tracker.meta.azk_version;
      }
    }

    this.opts = opts;
  }

  sendError(error_to_send) {
    // get user email
    let configuration = new Configuration();

    this.opts.person = {
      // Required: id
      // A string up to 40 characters identifying this user in your system.
      "id": configuration.load('tracker_user_id'),
      // Optional: email
      // A string up to 255 characters
      "email": configuration.load('user.email')
    };

    var endpoint_url = config('report:url');
    var options = {
      err            : error_to_send,
      extra_values   : this.opts,
      url            : endpoint_url,
      background_send: false, //FIXME: change to background_send = true
      jsonWrapper    : (payload) => { return { report: payload }; },
    };

    var bugSender = new lazy.CrashReportSender();

    return bugSender.send(options)
    .timeout(4000)
    .then((result) => {
      log.debug(`[crash-report] bug report send to ${endpoint_url}. result bellow:`);
      log.debug(result);
    })
    .catch((err_result) => {
      log.debug(`[crash-report] error sending bug report to ${endpoint_url}. error below:`);
      log.debug(err_result);
      var JSON_SENT = JSON.parse(err_result.requestOptions);
      /**/console.log('\n>>---------\n err_result.requestOptions.body:\n',
      JSON.stringify(JSON_SENT, ' ', 2), '\n>>---------\n');
    });
  }

  saveCrashReportAlwaysSend(response_bool) {
    return azkMeta.set('crashReports.always_send', response_bool);
  }

  loadCrashReportAlwaysSend() {
    if (config('crashReport:disable')) {
      return false;
    }
    var permission = azkMeta.get('crashReports.always_send');
    log.debug(`[crashReport] permission: ${permission}`);
    return permission;
  }

};
