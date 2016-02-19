import h from 'spec/spec_helper';
import { _, lazy_require } from 'azk';
import { handler } from 'azk/cli/error_handler';
import { MustAcceptTermsOfUse, AzkError } from 'azk/utils/errors';
import { promiseReject, promiseResolve } from 'azk/utils/promises';

var lazy = lazy_require({
  Configuration   : ['azk/configuration'],
  AskSendErrorView: ['azk/cli/views/ask_send_error_view'],
});

describe('Azk cli, error handler', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  it("should exited with 1 if not pass a error", function() {
    var result = handler({});
    return h.expect(result).to.eventually.equal(1);
  });

  it("should show require accept terms if error instance of MustAcceptTermsOfUse", function() {
    var error   = new MustAcceptTermsOfUse();
    var msg_rgx = new RegExp(h.escapeRegExp(error.toString()));
    var result  = handler(error, { ui }).then((code) => {
      return { code, msg: outputs[0]};
    });

    return h.expect(result).to.eventually
      .containSubset({code: 1})
      .and.have.property("msg").and.match(msg_rgx);
  });

  it("should send a report if error is not a MustAcceptTermsOfUse", function() {
    var error  = new Error('erro test');
    var sended = null;
    let tracker = {
      sendEvent(type, data) {
        sended = { type, data };
        return promiseReject(new Error('sender is mocked'));
      }
    };

    var result = handler(error, { tracker, ui }).then((code) => {
      sended.code = code;
      return sended;
    });

    return h.expect(result).to.eventually.containSubset({
        code: 1,
        type: 'error',
        data: {
          message: error.message
        }
      });
  });

  describe("with ui.tracker.sendEvent functional", function() {
    let tracker = {
      sendEvent() {
        return promiseResolve();
      },
      meta: {
        user_id: '[user_id_test]',
      }
    };

    let namespace = 'test.error_handler';
    let configuration = new lazy.Configuration({ namespace });

    beforeEach(() => {
      configuration.resetAll();
    });

    it("should not send crashreport for a known error", function() {
      let error  = new AzkError();
      let result = handler(error, { tracker, ui });
      return h.expect(result).to.eventually.equal(1);
    });

    describe("and have a reportable erro", function() {
      let always_key = 'crash_reports.always_send';

      // reportable error
      let error = new AzkError('test');
      error.report = true;

      it("should skip send and not show mensage if not interactive", function() {
        configuration.save(always_key, false);
        let view  = new lazy.AskSendErrorView(_.clone(ui), configuration);
        let msg_rgx = new RegExp(h.escapeRegExp(error.toString()));

        let result = handler(error, { tracker, view }).then((code) => {
          return { code, msg: outputs[0]};
        });
        return h.expect(result).to.eventually
          .containSubset({code: 1})
          .and.have.property("msg").and.match(msg_rgx);
      });

      it("should call the crashReport.sendError and show progress with msgs", function() {
        configuration.save(always_key, true);
        let view  = new lazy.AskSendErrorView(_.clone(ui), configuration);

        // mock crashReport
        let called_with = null;
        let crashReport = {
          sendError(err) {
            called_with = err;
            return promiseResolve();
          }
        };

        let result = handler(error, { tracker, view, crashReport }).then((code) => {
          h.expect(outputs[0]).to.match(new RegExp(h.escapeRegExp(error.toString())));
          h.expect(outputs[2]).to.match(h.regexFromT('crashReport.sending'));
          h.expect(outputs[3]).to.match(h.regexFromT('crashReport.was_sent'));
          return { code, called_with };
        });
        return h.expect(result).to.eventually
          .containSubset({
            code: 1,
            called_with: error,
          });
      });

      it("should call the crashReport.sendError and show error send msgs", function() {
        configuration.save(always_key, true);
        let view  = new lazy.AskSendErrorView(_.clone(ui), configuration);

        // mock crashReport
        let crashReport = {
          sendError() {
            return promiseReject();
          }
        };

        let result = handler(error, { throw_error: true, tracker, view, crashReport }).then((code) => {
          h.expect(outputs[0]).to.match(new RegExp(h.escapeRegExp(error.toString())));
          h.expect(outputs[2]).to.match(h.regexFromT('crashReport.sending'));
          h.expect(outputs[3]).to.match(h.regexFromT('crashReport.was_not_sent'));
          return { code };
        });
        return h.expect(result).to.eventually.deep.containSubset({code: 1});
      });
    });
  });
});
