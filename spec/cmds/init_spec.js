import h from 'spec/spec_helper';
import { config, path, t, utils } from 'azk';
import { init } from 'azk/cmds/init';
import { Manifest } from 'azk/manifest';

describe("Azk command init", function() {
  var manifest = config('manifest');
  var outputs  = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var cmd = init(UI);

  describe("run in a project already has a manifest", function() {
    var project;

    before(() => {
      return h.tmp_dir().then((dir) => {
        project = dir;
        cmd.cwd = project;
        h.touchSync(path.join(project, manifest));
      });
    });

    it("should fail", function() {
      var message = t("commands.init.already", manifest);
      return cmd.run([]).then((code) => {
        h.expect(code).to.equal(1);
        h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp(message)));
      });
    });

    it("should sucess if --force is passed", function() {
      var message = t("commands.init.already", manifest);
      return cmd.run(["--force"]).then((code) => {
        h.expect(code).to.equal(0);
        h.expect(outputs[0]).to.not.match(RegExp(h.escapeRegExp(message)));
      });
    });
  });


  it("should generate a manifest with a example system in a blank dir", function() {
    return h.tmp_dir().then((project) => {
      cmd.cwd = project;
      return cmd.run([]).then(() => {

        // Check generated manifest
        var manifest = new Manifest(project);
        var system   = manifest.systemDefault;
        var name     = path.basename(project);
        h.expect(system).to.have.deep.property("name", "example");
        h.expect(system).to.have.deep.property("image.name", "[repository]:[tag]");
        h.expect(system).to.have.deep.property("depends").and.to.eql([]);
        h.expect(system).to.have.deep.property("mounts")
          .and.to.eql({ ["/azk/" + name]: utils.docker.resolvePath(manifest.manifestPath) });
        h.expect(system).to.have.deep.property("options.workdir", "/azk/" + name);
        h.expect(system).to.have.deep.property("options.command")
          .and.to.eql("# command to run app");
        h.expect(system).to.have.deep.property("options.envs")
          .and.to.eql({ EXAMPLE: "value" });

        // Check messages
        var message = t("commands.init.not_found");
        h.expect(outputs[0]).to.match(RegExp(h.escapeRegExp(message)));
      });
    });
  });
});
