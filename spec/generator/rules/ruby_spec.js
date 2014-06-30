import { config, path, fs } from 'azk';
import h from 'spec/spec_helper';
import { Generator } from 'azk/generator';
import { Manifest } from 'azk/manifest';

describe("Azk generator ruby rule", function() {
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
    h.touchSync(path.join(project, "Gemfile"));
    var manifest = generateAndReturnManifest(project);
    var system   = manifest.systemDefault;

    h.expect(system).to.have.deep.property("name", name);
    h.expect(system).to.have.deep.property("image.name", "dockerfile/ruby:latest");
    h.expect(system).to.have.deep.property("depends").and.to.eql([]);
    h.expect(system).to.have.deep.property("options.workdir", "/azk/" + name);
    h.expect(system).to.have.deep.property("options.mount_folders")
      .and.to.eql({ ".": "/azk/" + name });
    h.expect(system).to.have.deep.property("options.command")
      .and.to.eql("rackup -c config.ru --port $PORT");
    h.expect(system).to.have.deep.property("options.provision")
      .and.to.eql(["bundle install --path vendor/bundler"]);
  });

  it("should detect sub-system", function() {
    var sub = path.join(project, "sub");
    fs.mkdirSync(sub);
    h.touchSync(path.join(sub, "Gemfile"));

    var manifest = generateAndReturnManifest(project);
    var system   = manifest.system("sub");

    h.expect(system).to.have.deep.property("name", "sub");
    h.expect(system).to.have.deep.property("options.workdir", "/azk/" + name + "/sub");
  });
});
