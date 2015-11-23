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

  it("should azk config list show current config", function() {
    doc_opts.argv = ['config', 'list'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('config', true);
      h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp('user.email')));
      h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp('bugReports.always_send')));
    });
  });

  it("should run a config track-toggle command", function() {
    doc_opts.argv = ['config', 'track-toggle', 'off'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('config', true);
      h.expect(options).to.have.property('track-toggle', true);
      h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp('Currently azk is not tracking any data')));
    });
  });

  let changeConfigTo = (configCommand, newStatus) => {
    doc_opts.argv = ['config', configCommand, newStatus];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options)
    .then((code) => {
      return {
        code: code,
        options: options,
      };
    });
  };

  it("should azk config bug-report-toggle change status", function() {
    return changeConfigTo('bug-report-toggle', 'on')
    .then((result) => {
      h.expect(result.code).to.equal(0);
      h.expect(result.options).to.have.property('config', true);
      h.expect(result.options).to.have.property('bug-report-toggle', true);
      let lastMessage = outputs[outputs.length - 1];
      h.expect(lastMessage).to.match(RegExp(h.escapeRegExp('azk is automatically sending bug-reports')));

      return changeConfigTo('bug-report-toggle', 'off');
    })
    .then((result) => {
      h.expect(result.code).to.equal(0);
      let lastMessage = outputs[outputs.length - 1];
      h.expect(lastMessage).to.match(RegExp(h.escapeRegExp('azk is not sending')));

      return changeConfigTo('bug-report-toggle', 'null');
    })
    .then((result) => {
      h.expect(result.code).to.equal(0);
      let lastMessage = outputs[outputs.length - 1];
      h.expect(lastMessage).to.match(RegExp(h.escapeRegExp('is not set')));
    });

  });

});
