import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';

describe('Azk cli, version controller', function() {
  var outputs = [];
  var ui = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('version', (p) => p.version || p['--version']);

  var doc_opts    = { exit: false };
  var run_options = { ui: ui };
  var version_regex = /azk version \d+\.\d+\.\d+, build \w+/;

  it('should run a version command', function() {
    doc_opts.argv = 'version';
    var options = cli.docopt(doc_opts);
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.eql(0);
      h.expect(options).to.have.property('version', true);
      h.expect(outputs[0]).to.match(version_regex);
    });
  });

  it('should run a --version command', function() {
    doc_opts.argv = '--version';
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.eql(0);
      h.expect(outputs[0]).to.match(version_regex);
    });
  });
});
