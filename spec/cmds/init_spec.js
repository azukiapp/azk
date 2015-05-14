import h from 'spec/spec_helper';
import { config, path, t, utils } from 'azk';
import { Cli } from 'azk/cli';
import { Manifest } from 'azk/manifest';

describe('Azk cli init controller', function() {
  var outputs = [];
  var ui       = h.mockUI(beforeEach, outputs);
  var manifest = config('manifest');

  var cli_options = {};
  var cli = new Cli(cli_options)
    .route('/init');

  var doc_opts    = { exit: false };
  var run_options = { ui: ui };

  describe("run in a project already has a manifest", function() {
    var message = t("commands.init.already_exists", manifest);

    before(() => {
      return h.tmp_dir().then((project) => {
        run_options.cwd = project;
        h.touchSync(path.join(project, manifest));
      });
    });

    it("should fail", function() {
      doc_opts.argv = ['init'];
      var options = cli.router.cleanArgs(cli.docopt(doc_opts));
      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(1);
        h.expect(options).to.have.property('init', true);
        h.expect(options).to.have.property('path', null);
        h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp(message)));
      });
    });

    it("should sucess if --force is passed", function() {
      doc_opts.argv = ['init', '--force'];
      var options = cli.docopt(doc_opts);
      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(options).to.have.property('--force', true);
        h.expect(code).to.equal(0);
        h.expect(outputs[0]).to.not.match(RegExp(h.escapeRegExp(message)));
      });
    });
  });

  it("should generate a manifest with a example system in a blank dir", function() {
    return h.tmp_dir().then((project) => {
      doc_opts.argv   = ['init'];
      run_options.cwd = project;
      var options = cli.docopt(doc_opts);

      // Check generated manifest
      var manifest = new Manifest(project);
      var system   = manifest.systemDefault;
      var name     = path.basename(project);

      return cli.run(doc_opts, run_options).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(options).to.have.property('path', null);
        h.expect(options).to.have.property('filename', false);

        h.expect(system).to.have.deep.property("name", "example");
        h.expect(system).to.have.deep.property("image.name", "[repository]:[tag]");
        h.expect(system).to.have.deep.property("depends").and.to.eql([]);

        var obj = {};
        obj[`/azk/${name}`] = utils.docker.resolvePath(manifest.manifestPath);
        h.expect(system).to.have.deep.property("options.workdir", `/azk/${name}`);
        h.expect(system).to.have.deep.property("mounts"         ).and.to.eql(obj);
        h.expect(system).to.have.deep.property("options.command").and.to.eql("# command to run app");
        h.expect(system).to.have.deep.property("options.envs"   ).and.to.eql({ EXAMPLE: "value" });

        // Check messages
        var message = t("commands.init.not_found");
        h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp(message)));
      });
    });
  });
});
