import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';

h.describeRequireVm('Azk cli, deploy controller', function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('deploy');

  var doc_opts    = { exit: false };
  var run_options = { ui: ui, cwd: __dirname };

  describe('run command', function () {
    it("`deploy`", function() {
      doc_opts.argv = ['deploy'];
      var options = cli.router.cleanParams(cli.docopt(doc_opts));

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('deploy', true);
      });
    });

    it("`deploy fast`", function() {
      doc_opts.argv = ['deploy', 'fast'];
      var options = cli.router.cleanParams(cli.docopt(doc_opts));

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('deploy', true);
        h.expect(options).to.have.property('fast', true);
      });
    });

    it("`deploy slow`", function() {
      doc_opts.argv = ['deploy', 'slow'];
      var options = cli.router.cleanParams(cli.docopt(doc_opts));

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('deploy', true);
        h.expect(options).to.have.property('slow', true);
      });
    });

    it("`deploy restart`", function() {
      doc_opts.argv = ['deploy', 'restart'];
      var options = cli.router.cleanParams(cli.docopt(doc_opts));

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('deploy', true);
        h.expect(options).to.have.property('restart', true);
      });
    });

    it("`deploy ssh`", function() {
      doc_opts.argv = ['deploy', 'ssh'];
      var options = cli.router.cleanParams(cli.docopt(doc_opts));

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('deploy', true);
        h.expect(options).to.have.property('ssh', true);
      });
    });

    it("`deploy versions`", function() {
      doc_opts.argv = ['deploy', 'versions'];
      var options = cli.router.cleanParams(cli.docopt(doc_opts));

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('deploy', true);
        h.expect(options).to.have.property('versions', true);
      });
    });

    it("`deploy rollback`", function() {
      doc_opts.argv = ['deploy', 'rollback'];
      var options = cli.router.cleanParams(cli.docopt(doc_opts));

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('deploy', true);
        h.expect(options).to.have.property('rollback', true);
      });
    });

    it("`deploy rollback <git-ref>`", function() {
      doc_opts.argv = ['deploy', 'rollback', 'v2'];
      var options = cli.router.cleanParams(cli.docopt(doc_opts));

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('deploy', true);
        h.expect(options).to.have.property('rollback', true);
        h.expect(options).to.have.property('git-ref', "v2");
      });
    });
  });
});
