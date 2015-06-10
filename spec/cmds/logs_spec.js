import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';

describe('Azk cli, logs controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('logs');

  var doc_opts    = { exit: false };
  var run_options = { ui: ui, cwd: __dirname };

  it("should run a `logs` command", function() {
    doc_opts.argv = ['logs'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('logs', true);
    });
  });
});
