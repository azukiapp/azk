import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';
import Azk from 'azk';

describe('Azk cli, doctor controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('doctor');

  var doc_opts    = { exit: false };
  var run_options = { ui: ui, cwd: __dirname };

  it("should run a `doctor` command", function() {
    doc_opts.argv = ['doctor'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('doctor', true);
      h.expect(outputs[0]).to.match(RegExp(`Version.*\:.*${h.escapeRegExp(Azk.version)}`));
      h.expect(outputs[0]).to.match(RegExp(`Agent.*\:.*Running`));
    });
  });

  it("should run a `doctor --logo` command", function() {
    doc_opts.argv = ['doctor', '--logo'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('doctor', true);
      h.expect(outputs[0]).to.match(RegExp(`Version.*\:.*${h.escapeRegExp(Azk.version)}`));
      h.expect(outputs[0]).to.match(RegExp(`Agent.*\:.*Running`));
    });
  });
});
