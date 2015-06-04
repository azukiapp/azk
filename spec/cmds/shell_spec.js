import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';

describe('Azk cli, shell controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('shell');

  var doc_opts    = { exit: false };
  var run_options = { ui: ui, cwd: h.fixture_path('slim-app') };

  it("should run a `shell example -c 'echo test'` command", function() {
    doc_opts.argv = ['shell', 'example', '-c', 'echo test'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('shell', true);
      h.expect(options).to.have.property('system', 'example');
      h.expect(outputs[0]).to.match(RegExp('test', 'gi'));
    });
  });

  it("should run a `shell` command with many arguments", function() {
    doc_opts.argv = [
      'shell', 'example', '-c', 'ls -alh; env',
      '-m', '/tmp:/azk/old', '-m', '/var/tmp:/azk/tmp',
      '-C', '/azk/', '-e', 'DATA=OK', '-e', 'KR=EU'
    ];

    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('shell', true);
      h.expect(options).to.have.property('system', 'example');
      h.expect(outputs[0]).to.match(RegExp('tmp', 'gm'));
      h.expect(outputs[0]).to.match(RegExp('old', 'gm'));
      h.expect(outputs[1]).to.match(RegExp('DATA=OK', 'gm'));
      h.expect(outputs[1]).to.match(RegExp('KR=EU', 'gm'));
    });
  });
});
