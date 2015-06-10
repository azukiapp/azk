import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';
import { promiseResolve } from 'azk/utils/promises';

describe('Azk cli, scale controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('scale', null, (params={}) => {
      ui.output(`scaling \`${params.system}\` system from 0 to ${params.to} instances...`);
      return promiseResolve(0);
    });

  var doc_opts    = { exit: false };
  var run_options = { ui: ui, cwd: h.fixture_path('slim-app') };

  it("should run a `scale example 2` command", function() {
    doc_opts.argv = ['scale', 'example', '2'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('scale', true);
      h.expect(options).to.have.property('system', 'example');
      h.expect(options).to.have.property('to', '2');
      h.expect(outputs[0]).to.match(RegExp('scaling `example` system from 0 to 2 instances...', 'gi'));
    });
  });
});
