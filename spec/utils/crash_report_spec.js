import h from 'spec/spec_helper';
import { lazy_require, set_config, config } from 'azk';
import { CrashReport } from 'azk/utils/crash_report';
import { default as tracker } from 'azk/utils/tracker';
import { promiseResolve, promiseReject } from 'azk/utils/promises';

var lazy = lazy_require({
  Configuration: ['azk/configuration'],
});

describe('Azk crash report util', function() {
  // default crash report and mock ui
  var crashReport, outputs = [];
  var namespace = 'test.crash_report_util';
  var configuration = new lazy.Configuration({ namespace });
  var ui        = h.mockUI(beforeEach, outputs, () => {
    ui = null;
    crashReport = new CrashReport({}, tracker, configuration);
    set_config('report:disable', true);
    crashReport.saveCrashReportAlwaysSend(null);
  });

  it('should get info from tracker', function() {
    h.expect(crashReport)
      .have.deep.property("extra_values.meta.user_id")
      .and.not.be.undefined;

    h.expect(crashReport)
      .have.deep.property("extra_values.server.os")
      .and.not.be.undefined;

    // get info from tracker:
    //
    //   { opts:
    //     { meta:
    //       { command_id: 'command_id:e7939d3a',
    //         user_id: 'tracker_user_id:48516fd9',
    //         azk_version: '0.16.0' },
    //     server:
    //       { os: 'Linux 3.16',
    //         proc_arch: 'x64',
    //         total_memory: 7968,
    //         cpu_info: 'Intel(R) Core(TM) i5-2400 CPU @ 3.10GHz',
    //         cpu_count: 4 } } }
  });

  it("should not send if report is disabled", function() {
    var sended = false;
    var sender = { send() { sended = true; } };
    var result = crashReport.sendError({}, sender);
    return h.expect(result).to.eventually.fail;
  });

  it("should not send if not always to send", function() {
    var sended = false;
    var sender = { send() { sended = true; } };

    // Enable send and disable user always send
    set_config('report:disable', false);
    crashReport.saveCrashReportAlwaysSend(false);
    var result = crashReport.sendError({}, sender);

    return h.expect(result).to.eventually.fail;
  });

  it("should return false if sender fail", function() {
    var sended = false;
    var sender = { send(options) {
      sended = true;
      return promiseReject(options);
    }};

    // Enable send and disable user always send
    set_config('report:disable', false);
    crashReport.saveCrashReportAlwaysSend(true);

    var result = crashReport.sendError({}, sender);
    return h.expect(result).to.eventually.and.fail;
  });

  it("should send from sender it always to send", function() {
    var sended = false;
    var sender = { send(options) {
      sended = options;
      return promiseResolve(options);
    }};

    // Enable send and disable user always send
    set_config('report:disable', false);
    crashReport.saveCrashReportAlwaysSend(true);

    var result = crashReport.sendError({}, sender)
    .then((sucessed) => {
      return { sucessed, sended };
    });

    return h.expect(result).to.eventually.containSubset({
      sucessed: true,
      sended: {
        err: {},
        url: config('report:url'),
        extra_values: {
          person: {
            id: configuration.load('tracker_user_id'),
          }
        }
      }
    });
  });
});
