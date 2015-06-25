import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';
import { promiseResolve } from 'azk/utils/promises';

describe('Azk cli, start controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('start', null, (params={}) => {
      ui.output(`starting \`${params.system}\`...`);
      return promiseResolve(0);
    });

  var doc_opts    = { exit: false };
  var run_options = { ui: ui, cwd: h.fixture_path('slim-app') };

  it("should run a `start example` command", function() {
    doc_opts.argv = ['start', 'example'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('start', true);
      h.expect(options).to.have.property('system', 'example');
      h.expect(outputs[0]).to.match(RegExp('starting `example`...', 'gi'));
    });
  });

  it("should accept git-repo argument", function() {
    doc_opts.argv = ['start', 'git@github.com:azukiapp/azkdemo.git', '--git-ref', 'master'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('start', true);
      h.expect(options).to.have.property('git-repo', 'git@github.com:azukiapp/azkdemo.git');
      h.expect(options).to.have.property('git-ref', 'master');
    });
  });

});
