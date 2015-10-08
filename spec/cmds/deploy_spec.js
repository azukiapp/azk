import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';

h.describeRequireVm('Azk cli, deploy controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('deploy');

  var doc_opts    = { exit: false };
  var run_options = { ui: ui, cwd: __dirname };

  it("should run a `deploy` command", function() {
    doc_opts.argv = ['deploy'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));

    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('deploy', true);
    });
  });
});
