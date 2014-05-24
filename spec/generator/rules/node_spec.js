import { config, path, fs } from 'azk';
import h from 'spec/spec_helper';
import { generator } from 'azk/generator';

var touch = require('touch');

describe("Azk generator node rule", function() {
  var project = null;
  var name    = null;

  before(function() {
    return h.tmp_dir({ prefix: "azk-" }).then((dir) => {
      project = dir;
      name    = path.basename(dir);
    });
  });

  it("should detect single node system", function() {
    touch.sync(path.join(project, "package.json"));
    var systems = generator.findSystems(project);
    h.expect(systems).to.have.deep.property("[0].name", name);
    h.expect(systems).to.have.deep.property("[0].depends").and.to.eql([]);
    h.expect(systems).to.have.deep.property("[0].workdir", "/app");
    h.expect(systems).to.have.deep.property("[0].sync_files", true);
    h.expect(systems).to.have.deep.property("[0].command")
      .and.to.eql("node index.js");
  });

  it("should detect sub-system", function() {
    var sub = path.join(project, "sub");
    fs.mkdirSync(sub);
    touch.sync(path.join(sub, "package.json"));
    var systems = generator.findSystems(project);
    h.expect(systems).to.have.length(2);
    h.expect(systems).to.have.deep.property("[0].name", name);
    h.expect(systems).to.have.deep.property("[1].name", "sub");
    h.expect(systems).to.have.deep.property("[1].workdir", "/app/sub");
  });
});
