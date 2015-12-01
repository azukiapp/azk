import { log } from 'azk';
import { Helpers } from 'azk/cli/helpers';
import { AzkError, MustAcceptTermsOfUse } from 'azk/utils/errors';
import CrashReportUtil from 'azk/configuration/crash_report';

module.exports = class ErrorHandler {
  static handle(ui, error) {
    var isError = error instanceof Error;
    if (!isError) {
      // no error type
      log.debug(`[crash-report] expected an error but got: "${error}"`);
      return ui.exit(1);
    }

    // exit 1: fully ignored errors
    if (error instanceof MustAcceptTermsOfUse) {
      log.debug(`[crash-report] exit 1: "${error.translation_key}"`);
      return ui.exit(0);
    }

    ui.fail(error);


    // TODO: send small error to tracker


    // exit 2: ignored AzkError
    if (error instanceof AzkError && error.report === false) {
      log.debug(`[crash-report] exit 2: "${error.translation_key}"`);
      return ui.exit(error.code || 1);
    }

    ui.warning('crashReport.message_error_occured');
    log.debug(`[crash-report] error: "${error.translation_key}"`);

    return Helpers.askToSendError(ui)
    .then((will_send_error) => {
      if (will_send_error) {
        ui.ok('crashReport.sending');
        log.debug(`[crash-report] sending...`);
        var crashReportUtil = new CrashReportUtil({}, ui.tracker);

        return crashReportUtil.sendError(error)
        .then((result) => {
          ui.ok('crashReport.was_sent');
          log.debug(`[crash-report] Force response OK: ${result && result.body}`);
          ui.exit(error.code ? error.code : 127);
        })
        .catch((err)=> {
          log.debug(`[crash-report] Force response error: ${err}`);
          ui.fail(err);
          return ui.exit(err.code || 1);
        });

      }
    });
  }
};
