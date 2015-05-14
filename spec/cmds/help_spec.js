import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';

describe('Azk cli help controller', function() {
  var outputs = [];
  var ui = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('/help');

  var doc_opts    = { exit: false };
  var run_options = { ui: ui };

  var should  = cli.help.replace('\n', '') + "\n";

  it("should run help command", function() {
    doc_opts.argv = 'help';
    var options = cli.docopt(doc_opts);
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.eql(0);
      h.expect(options).to.have.property('help', true);
      h.expect(outputs[0]).to.eql(should);
    });
  });

  it("should run --help command", function() {
    doc_opts.argv = ['--help'];
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.eql(0);
      h.expect(outputs[0]).to.eql(should);
    });
  });

  it("should run -h command", function() {
    doc_opts.argv = '-h';
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.eql(0);
      h.expect(outputs[0]).to.eql(should);
    });
  });
});
