import { config } from 'azk';
import { Manifest, file_name } from 'azk/manifest';
import h from 'spec/spec_helper';

var path = require('path');

describe("Azk manifest module", function() {
  it("should return not found manifest", function() {
    return h.tmp_dir({ prefix: "azk-" }).then(function(dir) {
      h.expect(Manifest.find_manifest(dir)).to.equal(null);
    });
  });

  describe("dsl spec", function() {
    var project  = h.fixture_path('full_example');

    it("should find manifest file", function() {
      var manifest = new Manifest(project);
      h.expect(manifest).to.have.property('file', path.join(project, file_name));
    });

    it("should parse manifest file", function() {
      var manifest = new Manifest(project);
      h.expect(manifest).to.have.property('systems');
    });
  });
});
