var h    = require('../spec_helper.js');
var App  = require('../../lib/app');
var path = require('path');
var fs   = require('q-io/fs');

var azk  = h.azk;
var Q = azk.Q;

describe("Azk app module", function() {
  describe("with valid 'azk app' folder", function() {
    var ancestor_dir, app_dir;

    beforeEach(function() {
      return h.mock_app({ id: "fe0598b51044470" }).then(function(dir) {
        ancestor_dir = azk.utils.resolve(dir);

        var data = {
          id: "25b2946ba8a7459",
          box: ancestor_dir,
          build: [ "# step1"]
        };
        return h.mock_app(data).then(function(dir) {
          app_dir = azk.utils.resolve(dir);
        });
      });
    });

    it("should return a new app id", function() {
      var id = App.new_id()
      h.expect(id).to.have.length(32)
      .and.match(/^[0-9a-f]+$/)
    });

    it("should return a manifest", function() {
      var manifest = path.join(app_dir, azk.cst.MANIFEST);
      h.expect(App.find_manifest(app_dir)).to.equal(manifest);
    });

    it("should return not found manifest", function() {
      return h.tmp.dir({ prefix: "azk-" })
      .then(function(dir) {
        h.expect(App.find_manifest(dir)).to.equal(null);
      });
    });

    describe("and request a new object", function() {
      it("should find manifest and parse then", function() {
        var id  = "25b2946ba8a7459";
        var app = new App(app_dir);

        h.expect(app).to.have.property("id", id);
        h.expect(app).to.have.property("file" , path.join(app_dir, azk.cst.MANIFEST));

        h.expect(app).to.have.property("type", "app");
        h.expect(app).to.have.property("repository", "azk/apps/" + id);
        h.expect(app).to.have.property("image", "azk/apps/" + id + ":latest");
        h.expect(app).to.have.property("path" , app_dir);

        h.expect(app).to.have.deep.property("content.box", ancestor_dir);
        h.expect(app).to.have.deep.property("from.path", ancestor_dir);

        h.expect(app).to.have.deep.property("steps[0]", "# step1");
      });

      it("should parse box manifest", function() {
        var id  = "fe0598b51044470";
        var app = new App(ancestor_dir);
        h.expect(app).to.have.deep.property("from.image", "ubuntu:12.04");
      });
    });
  });
});
