import { config, path, fs, utils } from 'azk';
import h from 'spec/spec_helper';
import { Generator } from 'azk/generator';
import { Manifest } from 'azk/manifest';

describe("Azk generator node rule", function() {
  var project = null;
  var name    = null;
  var outputs = [];
  var UI  = h.mockUI(beforeEach, outputs);
  var generator = new Generator(UI);

  before(function() {
    return h.tmp_dir().then((dir) => {
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
    var command  = new RegExp(h.escapeRegExp("node index.js"));

    h.expect(system).to.have.deep.property("name", name);
    h.expect(system).to.have.deep.property("image.name", "dockerfile/nodejs:latest");
    h.expect(system).to.have.deep.property("depends").and.to.eql([]);
    h.expect(system).to.have.deep.property("command").and.to.match(command);
    h.expect(system).to.have.deep.property("mounts")
      .and.to.eql({ ["/azk/" + name]: utils.docker.resolvePath(manifest.manifestPath) });
    h.expect(system).to.have.deep.property("options.workdir", "/azk/" + name);
    h.expect(system).to.have.deep.property("options.provision")
      .and.to.eql(["npm install"]);

    h.expect(system).to.have.property("scalable").and.ok;
    h.expect(system).to.have.property("hostname").and.match(new RegExp(name));
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
