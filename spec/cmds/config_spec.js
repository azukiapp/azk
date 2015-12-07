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

  it("should azk config list show all config", function() {
    doc_opts.argv = ['config', 'list'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('config', true);

      // match
      h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp('user.email')));

      // match
      h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp('crashReports.always_send')));
    });
  });

  it("should azk config list show user.email configuration status", function() {
    doc_opts.argv = ['config', 'list', 'user.email'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('config', true);

      // match
      h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp('user.email')));

      // not match
      h.expect(outputs[0]).to.not.match(RegExp(h.escapeRegExp('crashReports.always_send')));
    });
  });

  let changeConfigTo = (configKey, newStatus) => {
    doc_opts.argv = ['config', 'set', configKey, newStatus];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options)
    .then((code) => {
      return {
        code: code,
        options: options,
      };
    });
  };
});
