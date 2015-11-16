import { _, config, log, lazy_require } from 'azk';
import { meta as azkMeta } from 'azk';
import { promiseResolve } from 'azk/utils/promises';

var lazy = lazy_require({
  'BugSender': 'bug-report-sender',
});

module.exports = class BugReportUtil {
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
    if (!this.loadBugReportUtilPermission()) { return promiseResolve(false); }

    var endpoint_url = config('report:url');
    var options = {
      err            : error_to_send,
      extra_values   : this.opts,
      url            : endpoint_url,
      background_send: false,
      jsonWrapper    : (payload) => { return { report: payload }; },
    };

    var bugSender = new lazy.BugSender();

    // FIXME: remove this on end
    return bugSender.send(options)
    .timeout(10000)
    .then((result) => {
      log.debug(`[bug-report] bug report send to ${endpoint_url}. result bellow:`);
      log.debug(result);
    })
    .catch((err_result) => {
      log.debug(`[bug-report] error sending bug report to ${endpoint_url}. error below:`);
      log.debug(err_result);

      var JSON_SENT = JSON.parse(err_result.requestOptions);
      /**/console.log('\n>>---------\n err_result.requestOptions.body:\n', JSON.stringify(JSON_SENT, ' ', 2), '\n>>---------\n');/*-debug-*/
    });
  }

  saveBugReportUtilPermission(string) {
    return azkMeta.set('report:bug_report_permission', string);
  }

  loadBugReportUtilPermission() {
    if (config('bugReport:disable')) {
      return false;
    }
    var permission = azkMeta.get('report:bug_report_permission');
    log.debug(`[bugReport] permission: ${permission}`);
    return permission;
  }

};
