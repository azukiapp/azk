import { config } from 'azk';
import { Manifest, System, file_name } from 'azk/manifest';
import h from 'spec/spec_helper';

var path = require('path');

describe("Azk manifest module", function() {
  it("should return not found manifest", function() {
    return h.tmp_dir({ prefix: "azk-" }).then(function(dir) {
      h.expect(Manifest.find_manifest(dir)).to.equal(null);
    });
  });

  describe("in a valid azk project folder", function() {
    var project  = h.fixture_path('full_example');
    var manifest = new Manifest(project);

    it("should find manifest in root project folder", function() {
      h.expect(manifest).to.have.property('file', path.join(project, file_name));
    });

    it("should find manifest in subfolder", function() {
      var man = new Manifest(path.join(project, "lib"));
      h.expect(manifest).to.have.property('file', manifest.file);
    });

    it("should parse manifest file", function() {
      h.expect(manifest).to.have.property('systems')
        .and.have.property('front');
    });

    it("should set a default system", function() {
      h.expect(manifest).to.have.property('systemDefault')
        .and.eql(manifest.system('front'));
    });

    it("should parse systems to System class", function() {
      h.expect(manifest.system('front')).to.instanceof(System);
    });
  });
});
