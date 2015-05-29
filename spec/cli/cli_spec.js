import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';
import { InvalidCommandError } from 'azk/utils/errors';

describe('Azk cli module', function() {
  var outputs = [];
  var ui = h.mockUI(beforeEach, outputs);

  var cli_options = {
    controllers_root: h.fixture_require_path('cmds'),
    path: h.fixture_path('cli', 'usage.txt'),
  };
  var cli = new Cli(cli_options)
    .route('test_options');

  var doc_opts    = { exit: false };
  var run_options = {
    ui: ui,
    cwd: process.cwd()
  };

  it("should run a command", function() {
    doc_opts.argv = ['test_options', '-n', '20'];
    var options = cli.docopt(doc_opts);
    return cli.run(doc_opts, run_options).then((result) => {
      h.expect(result).to.eql([{ number: "20" }]);
      h.expect(options).to.have.property('--number', "20");
    });
  });

  it("should raise a invalid command", function() {
    doc_opts.argv = ['invalid_cmd'];
    var result = () => cli.run(doc_opts, run_options);
    h.expect(result).to.throw(InvalidCommandError, /Invalid command\: invalid_cmd/);
  });
});
