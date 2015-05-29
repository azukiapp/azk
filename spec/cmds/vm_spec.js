import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';

h.describeRequireVm('Azk cli, vm controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('vm');

  var doc_opts    = { exit: false };
  var run_options = { ui: ui };

  it("should run a vm status command", function() {
    doc_opts.argv = ['vm', 'status'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('vm', true);
      h.expect(options).to.have.property('status', true);
      h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp('Virtual machine running.')));
    });
  });

  it("should run a vm installed command", function() {
    doc_opts.argv = ['vm', 'installed'];
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('vm', true);
      h.expect(options).to.have.property('installed', true);
      h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp('Virtual machine already installed.')));
    });
  });

  it("should run a `vm ssh -- echo test` command", function() {
    doc_opts.argv = `vm ssh -- echo test`.split(' ');
    var options = cli.router.cleanParams(cli.docopt(doc_opts));
    return cli.run(doc_opts, run_options).then((code) => {
      h.expect(code).to.equal(0);
      h.expect(options).to.have.property('vm', true);
      h.expect(options).to.have.property('ssh', true);
      h.expect(options).to.have.property('__doubledash', true);
      h.expect(options['ssh-options']).to.deep.eql(['echo', 'test']);
      h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp('test')));
    });
  });
});
