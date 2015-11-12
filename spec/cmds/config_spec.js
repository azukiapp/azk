import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';

describe('Azk cli, config controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('config');

  var doc_opts    = { exit: false };
  var run_options = { ui: ui };

  process.env.AZK_DISABLE_TRACKER = true;

  it("should run a config track-status command", function() {
    doc_opts.argv = ['config', 'track-status'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('config', true);
      h.expect(options).to.have.property('track-status', true);
      h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp('currently azk is not tracking any data')));
    });
  });

  it("should run a config track-toggle command", function() {
    doc_opts.argv = ['config', 'track-toggle'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(false);
      h.expect(options).to.have.property('config', true);
      h.expect(options).to.have.property('track-toggle', true);
      h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp('currently azk is not tracking any data')));
    });
  });

  it("should run a config bug-report-status command", function() {
    doc_opts.argv = ['config', 'bug-report-status'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('config', true);
      h.expect(options).to.have.property('bug-report-status', true);
      h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp('currently azk is not sending any bug-report')));
    });
  });

  it("should run a config bug-report-toggle command", function() {
    doc_opts.argv = ['config', 'bug-report-toggle'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(false);
      h.expect(options).to.have.property('config', true);
      h.expect(options).to.have.property('bug-report-toggle', true);
      h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp('currently azk is not sending any bug-report')));
    });
  });
});
