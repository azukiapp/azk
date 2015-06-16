import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';

describe('Azk cli, status controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('status');

  var doc_opts    = { exit: false };
  var run_options = { ui: ui, cwd: __dirname };

  it("should run a `status` command", function() {
    doc_opts.argv = ['status'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('status', true);
      h.expect(outputs[0]).to.match(RegExp('System', 'gi'));
      h.expect(outputs[0]).to.match(RegExp('Inst\\.', 'gi'));
      h.expect(outputs[0]).to.match(RegExp('Hostname\\/url', 'gi'));
      h.expect(outputs[0]).to.match(RegExp('Instances\\-Ports', 'gi'));
    });
  });

  it("should run a `status --long` command", function() {
    doc_opts.argv = ['status', '--long'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('status', true);
      h.expect(outputs[0]).to.match(RegExp('Provisioned', 'gi'));
      h.expect(outputs[0]).to.match(RegExp('Image', 'gi'));
    });
  });

  it("should run a `status --long --short` command", function() {
    doc_opts.argv = ['status', '--long', '--short'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('status', true);
      h.expect(outputs[0]).to.not.match(RegExp('Provisioned', 'gi'));
      h.expect(outputs[0]).to.match(RegExp('Image', 'gi'));
    });
  });

  it("should run a `status --short` command", function() {
    doc_opts.argv = ['status', '--short'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('status', true);
      h.expect(outputs[0]).to.not.match(RegExp('Provisioned', 'gi'));
      h.expect(outputs[0]).to.not.match(RegExp('Image', 'gi'));
    });
  });
});
