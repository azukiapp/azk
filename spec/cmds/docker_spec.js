import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';

h.describeRequireVm('Azk cli, docker controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options).route('docker');

  var doc_opts    = { exit: false };
  var run_options = { ui: ui, cwd: __dirname };

  it("should run a `docker -- version` command", function() {
    doc_opts.argv = ['docker', '--', 'version'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('docker', true);
      h.expect(options).to.have.property('__doubledash', true);
      h.expect(options['docker-args']).to.deep.eql(['version']);
      h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp("\"docker\" \"version\"")));
    });
  });
});
