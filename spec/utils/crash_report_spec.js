import h from 'spec/spec_helper';
import CrashReportUtil from 'azk/configuration/crash_report';
// import { meta as azkMeta } from 'azk';
import { default as tracker } from 'azk/utils/tracker';

describe('Azk Bug Report', function() {
  this.timeout(2000);

  var crashReportUtil;

  beforeEach(function() {
    crashReportUtil = new CrashReportUtil({}, tracker);
  });

  it('should instantiate Bug Report', function() {
    return h.expect(crashReportUtil).to.not.be.undefined;
  });

  it('should get info from tracker', function() {
    h.expect(crashReportUtil.opts.meta.user_id).to.not.be.undefined;
    h.expect(crashReportUtil.opts.server.os).to.not.be.undefined;
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

  it('should save and load CrashReport Permission', function() {
    crashReportUtil.saveCrashReportAlwaysSend(true);
    h.expect(crashReportUtil.loadCrashReportAlwaysSend()).to.equal(true);

    crashReportUtil.saveCrashReportAlwaysSend(false);
    h.expect(crashReportUtil.loadCrashReportAlwaysSend()).to.equal(false);
  });

  describe('ask questions', function() {
    it('ask on errors', function() {
      let state = {
        is_interactive: false,
        always_send_crash_reports: undefined,
        current_saved_email: undefined,
        never_ask_email: undefined,
        email_ask_count: undefined,
      };
      // isTrackerActive: undefined,

      let result_flux = crashReportUtil.askQuestionsFlux(state);
      h.expect(result_flux).to.deep.equal([
        { question: 'askEmail' },
        { question: 'askAlwaysSendCrashReport' },
        { final_result: true },
      ]);
      // { question: 'ask_to_send_crash_report' },
      // { question: 'askCrashReportSendIndividualError' },

      crashReportUtil.saveCrashReportAlwaysSend(false);
      h.expect(crashReportUtil.loadCrashReportAlwaysSend()).to.equal(false);
    });
  });

});
