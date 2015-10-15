import h from 'spec/spec_helper';
import { Cli } from 'azk/cli';
import { SystemNotFoundError } from 'azk/utils/errors';

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

    it("`deploy clear-cache`", function() {
      doc_opts.argv = ['deploy', 'clear-cache'];
      var options = cli.router.cleanParams(cli.docopt(doc_opts));

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('deploy', true);
        h.expect(options).to.have.property('clear-cache', true);
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

    it("`deploy full`", function() {
      doc_opts.argv = ['deploy', 'full'];
      var options = cli.router.cleanParams(cli.docopt(doc_opts));

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('deploy', true);
        h.expect(options).to.have.property('full', true);
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

    it("`deploy shell`", function() {
      doc_opts.argv = ['deploy', 'shell'];
      var options = cli.router.cleanParams(cli.docopt(doc_opts));

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('deploy', true);
        h.expect(options).to.have.property('shell', true);
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

    it("`deploy rollback <ref>`", function() {
      doc_opts.argv = ['deploy', 'rollback', 'v2'];
      var options = cli.router.cleanParams(cli.docopt(doc_opts));

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('deploy', true);
        h.expect(options).to.have.property('rollback', true);
        h.expect(options).to.have.property('ref', "v2");
      });
    });

    it("`invalid` and should error", function() {
      doc_opts.argv = ['deploy', 'invalid'];

      var func = () => cli.docopt(doc_opts);
      h.expect(func).to.throw(InvalidCommandError, /deploy invalid/);
    });
  });

  describe("without deploy system", function() {
    var manifest;

    before(() => {
      var data = { };
      return h.mockManifest(data).then((mf) => {
        manifest = mf;
      });
    });

    it("should raise error if no get deploy system", function() {
      var func = () => manifest.getSystemsByName("deploy");
      h.expect(func).to.throw(SystemNotFoundError, /deploy/);
    });

    it("should no deploy system", function() {
      doc_opts.argv = ['deploy'];
      var options = cli.router.cleanParams(cli.docopt(doc_opts));
      var run_options = { ui: ui, cwd: manifest.cwd, just_parse: true };

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(1);
        h.expect(options).to.have.property('deploy', true);
      });
    });
  });

  describe("with deploy system", function() {
    var run_options = { ui: ui, cwd: h.fixture_path('slim-app'), just_parse: true };

    it("should run a `deploy` command", function() {
      doc_opts.argv = ['deploy'];
      var options = cli.router.cleanParams(cli.docopt(doc_opts));

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('deploy', true);
      });
    });

    it("should run a `deploy fast` command", function() {
      doc_opts.argv = ['deploy', 'fast'];
      var options = cli.router.cleanParams(cli.docopt(doc_opts));

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('deploy', true);
      });
    });
  });
});
