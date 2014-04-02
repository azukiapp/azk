import { config } from 'azk';
import { Manifest } from 'azk/manifest';
import h from 'spec/spec_helper';

describe("Azk manifest module", function() {
  it("should return not found manifest", function() {
    return h.tmp_dir({ prefix: "azk-" }).then(function(dir) {
      h.expect(Manifest.find_manifest(dir)).to.equal(null);
    });
  });

  describe("dsl spec", function() {
    it("should require and run a file", function() {
      var project = h.fixture_path('full_example');
      console.log(project)
    });
  });
});
