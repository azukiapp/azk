import { log, lazy_require, isBlank } from 'azk';
import { AzkError, MustAcceptTermsOfUse } from 'azk/utils/errors';
import { async } from 'azk/utils/promises';

var lazy = lazy_require({
  CrashReport: ['azk/utils/crash_report'],
  tracker: ['azk/utils/tracker', 'default'],
  AskSendErrorView: ['azk/cli/views/ask_send_error_view'],
});

function init_options(options) {
  if (isBlank(options.view)) {
    options.view = new lazy.AskSendErrorView(options.ui);
  }

  return [options.view, options.tracker || lazy.tracker];
}

function crash_report(options, tracker, view) {
  if (isBlank(options.crashReport)) {
    options.crashReport = new lazy.CrashReport({}, tracker, view.configuration);
  }
  return options.crashReport;
}

export function handler(error, options = {}) {
  return async(this, function* () {
    let isError = error instanceof Error || error instanceof AzkError;
    if (!isError) {
      // no error type
      log.debug(`[error-handler] expected an error but got: "${error}"`);
      return 1;
    }

    // get view and tracker from options
    let [view, tracker] = init_options(options);

    // exit 1: fully ignored errors
    if (error instanceof MustAcceptTermsOfUse) {
      log.debug(`[error-handler] exit 1: "${error.translation_key}"`);
      view.fail(error);
      return error.code;
    }

    view.fail(error);

    try {
      // tracker: send error name to tracker
      yield tracker.sendEvent("error", {
        code: error.code,
        message: error.message,
        translation_key: error.translation_key,
      });

      // exit 2: ignored AzkError
      if (error instanceof AzkError && error.report === false) {
        log.debug(`[error-handler] error report skip: "${error.translation_key}"`);
      } else {
        log.debug(`[error-handler] error to report: "${error.translation_key}"`);
        let will_send_error = yield view.askToSend();

        if (will_send_error) {
          view.ok('crashReport.sending');

          try {
            yield crash_report(options, tracker, view).sendError(error);
            view.ok('crashReport.was_sent');
          } catch (err) {
            log.debug('[error-handler] error to send crashReport: %s', err.toString());
            view.fail('crashReport.was_not_sent');
          }
        }
      }
    } catch (err) {}

    return error.code || 1;
  });
}
