import { config, path, fs } from 'azk';
import h from 'spec/spec_helper';
import { generator } from 'azk/generator';
import { Manifest } from 'azk/manifest';

describe("Azk generator node rule", function() {
  var project = null;
  var name    = null;

  before(function() {
    return h.tmp_dir({ prefix: "azk-" }).then((dir) => {
      project = dir;
      name    = path.basename(dir);
    });
  });

  var generateAndReturnManifest = (project) => {
    var manifest = path.join(project, config('manifest'));
    generator.render({
      systems: generator.findSystems(project),
    }, manifest);
    return new Manifest(project);
  }

  it("should detect single node system", function() {
    h.touchSync(path.join(project, "package.json"));
    var manifest = generateAndReturnManifest(project);
    var system   = manifest.systemDefault;

    h.expect(system).to.have.deep.property("name", name);
    h.expect(system).to.have.deep.property("image.name", "dockerfile/nodejs:latest");
    h.expect(system).to.have.deep.property("depends").and.to.eql([]);
    h.expect(system).to.have.deep.property("options.workdir", "/azk/" + name);
    h.expect(system).to.have.deep.property("options.sync_files")
      .and.to.eql({ ".": "/azk/" + name });
    h.expect(system).to.have.deep.property("options.command")
      .and.to.eql("node index.js");
    h.expect(system).to.have.deep.property("options.provision")
      .and.to.eql(["npm install"]);
  });

  it("should detect sub-system", function() {
    var sub = path.join(project, "sub");
    fs.mkdirSync(sub);
    h.touchSync(path.join(sub, "package.json"));

    var manifest = generateAndReturnManifest(project);
    var system   = manifest.system("sub");

    h.expect(system).to.have.deep.property("name", "sub");
    h.expect(system).to.have.deep.property("options.workdir", "/azk/" + name + "/sub");
  });
});
