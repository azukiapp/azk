import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';
import { lazy_require } from 'azk';

var lazy = lazy_require({
  Configuration: ['azk/configuration'],
});

describe('Azk cli, config controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('config');

  var doc_opts    = { exit: false };
  var run_options = { ui: ui };

  process.env.AZK_DISABLE_TRACKER = true;

  let configuration = null;
  before(()  => configuration = new lazy.Configuration());
  beforeEach(() => configuration.resetAll());

  it("should azk config list show all config", function() {
    doc_opts.argv = ['config', 'list'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('config', true);

      var ui_result = outputs.join("\n");
      h.expect(ui_result).to.match(/user\.email/);
      h.expect(ui_result).to.match(/crash_reports\.always_send/);
    });
  });

  it("should azk config list show user.email configuration status", function() {
    doc_opts.argv = ['config', 'list', 'user.email'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('config', true);

      var ui_result = outputs.join("\n");
      h.expect(ui_result).to.match(/user\.email.*\s.*/);
      h.expect(ui_result).not.to.match(/crash_reports\.always_send/);
    });
  });

  it("should support set a configuration", function() {
    let key   = 'user.email';
    let value = 'foo@bar.com';
    doc_opts.argv = ['config', 'set', key, value];

    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);

      var ui_result = outputs.join("\n");
      var msg_regex = h.regexFromT('commands.config.set_ok', { key, value });
      h.expect(ui_result).to.match(msg_regex);
    });
  });

  it("should support reset all configuration", function() {
    configuration.save('user.email', 'foo@bar.com');
    doc_opts.argv = ['config', 'reset'];
    return cli.run(doc_opts, run_options).then((code) => {
      let value = configuration.load('user.email');
      h.expect(value).to.undefined;
      h.expect(code).to.equal(0);

      var ui_result = outputs.join("\n");
      var msg_regex = h.regexFromT('commands.config.reset.confirmed');
      h.expect(ui_result).to.match(msg_regex);
    });
  });
});
