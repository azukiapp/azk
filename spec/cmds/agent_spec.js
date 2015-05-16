import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';

describe('Azk cli agent controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('/agent');

  var doc_opts    = { exit: false };
  var run_options = { ui: ui };

  it("should run a agent status command", function() {
    doc_opts.argv = ['agent', 'status'];
    var options = cli.router.cleanArgs(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('agent', true);
      h.expect(options).to.have.property('status', true);
      h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp('Agent is running...')));
    });
  });
});
