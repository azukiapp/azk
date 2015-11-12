import h from 'spec/spec_helper';
import BugReportUtil from 'azk/utils/bug_report';
// import { meta as azkMeta } from 'azk';
import { default as tracker } from 'azk/utils/tracker';

describe("Azk Bug Report", function() {
  this.timeout(2000);

  var bugReportUtil;

  beforeEach(function() {
    bugReportUtil = new BugReportUtil({}, tracker);
  });

  it("should instantiate Bug Report", function() {
    return h.expect(bugReportUtil).to.not.be.undefined;
  });

  it("should get info from tracker", function() {
    h.expect(bugReportUtil.opts.meta.user_id).to.not.be.undefined;
    h.expect(bugReportUtil.opts.server.os).to.not.be.undefined;
    // get info from tracker:
    //
    //   { opts:
    //    { meta:
    //       { command_id: 'command_id:e7939d3a',
    //         user_id: 'tracker_user_id:48516fd9',
    //         azk_version: '0.16.0' },
    //      server:
    //       { os: 'Linux 3.16',
    //         proc_arch: 'x64',
    //         total_memory: 7968,
    //         cpu_info: 'Intel(R) Core(TM) i5-2400 CPU @ 3.10GHz',
    //         cpu_count: 4 } } }
  });

  it("should loadBugReportPermission", function() {
    h.expect(bugReportUtil.loadBugReportPermission()).to.equal(false);
  });
});
