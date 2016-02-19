import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';
import { lazy_require } from 'azk';

let lazy = lazy_require({
  Configuration: ['azk/configuration'],
});

describe('Azk cli, config controller', function() {
  let outputs = [];
  let ui      = h.mockUI(beforeEach, outputs);

  let cli_options = {};
  let cli = new Cli(cli_options)
    .route('config');

  let doc_opts    = { exit: false };
  let run_options = { ui: ui };

  process.env.AZK_DISABLE_TRACKER = true;

  let configuration = null;
  before(()  => configuration = new lazy.Configuration());
  beforeEach(() => configuration.resetAll());

  it("should azk config list show all config", function() {
    doc_opts.argv = ['config', 'list'];
    let options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('config', true);

      let ui_result = outputs.join("\n");
      h.expect(ui_result).to.match(/user\.email/);
      h.expect(ui_result).to.match(/crash_reports\.always_send/);
    });
  });

  it("should azk config list show user.email configuration status", function() {
    doc_opts.argv = ['config', 'list', 'user.email'];
    let options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('config', true);

      let ui_result = outputs.join("\n");
      h.expect(ui_result).to.match(/user\.email.*\s.*/);
      h.expect(ui_result).not.to.match(/crash_reports\.always_send/);
    });
  });

  it("should support set string a configuration", function() {
    let key   = 'user.email';
    let value = 'foo@bar.com';
    doc_opts.argv = ['config', 'set', key, value];

    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);

      let ui_result = outputs.join("\n");
      let msg_regex = h.regexFromT('commands.config.set_ok', { key, value });
      h.expect(ui_result).to.match(msg_regex);
    });
  });

  it("should support set boolean a configuration", function() {
    let key   = 'user.email_always_ask';
    let value = 'false';
    doc_opts.argv = ['config', 'set', key, value];

    // check: config set
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);

      let ui_result = outputs.join("\n");
      let msg_regex = h.regexFromT('commands.config.set_ok', { key, value });
      h.expect(ui_result).to.match(msg_regex);

      // check: config list
      doc_opts.argv = ['config', 'list', 'user.email_always_ask'];
      let options = cli.router.cleanParams(cli.docopt(doc_opts));
      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('config', true);

        ui_result = outputs.join("\n");
        h.expect(ui_result).to.match(/user\.email_always_ask.+\[Y\/N\].+N/gm);
      });

    });
  });

  it("should support reset all configuration", function() {
    configuration.save('user.email', 'foo@bar.com');
    doc_opts.argv = ['config', 'reset'];
    return cli.run(doc_opts, run_options).then((code) => {
      let value = configuration.load('user.email');
      h.expect(value).to.undefined;
      h.expect(code).to.equal(0);

      let ui_result = outputs.join("\n");
      let msg_regex = h.regexFromT('commands.config.reset.confirmed');
      h.expect(ui_result).to.match(msg_regex);
    });
  });
});
