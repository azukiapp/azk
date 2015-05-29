import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';

describe('Azk cli, help controller', function() {
  var outputs = [];
  var ui = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('help', (p) => p.help || p['--help'])
    .route('agent');

  var doc_opts    = { exit: false };
  var run_options = { ui: ui };

  it("should run help command", function() {
    doc_opts.argv = 'help';
    var options = cli.docopt(doc_opts);
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.eql(0);
      h.expect(options).to.have.property('help', true);
      h.expect(outputs[0]).to.match(RegExp('Usage:', 'gi'));
    });
  });

  it("should run --help command", function() {
    doc_opts.argv = ['--help'];
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.eql(0);
      h.expect(outputs[0]).to.match(RegExp('Usage:', 'gi'));
    });
  });

  it("should run -h command", function() {
    doc_opts.argv = '-h';
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.eql(0);
      h.expect(outputs[0]).to.match(RegExp('Usage:', 'gi'));
    });
  });

  it("should run `agent --help` command", function() {
    doc_opts.argv = ['agent', '--help'];
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(result).to.eql(0);
      h.expect(outputs[0]).to.match(RegExp('Usage:', 'gi'));
    });
  });
});
