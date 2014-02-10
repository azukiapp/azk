var helper = require('../spec_helper.js');
var App    = require('../../lib/app');
var path   = require('path');
var fs     = require('q-io/fs');

var azk    = helper.azk;
var expect = helper.expect;

var Q = azk.Q;

describe("Azk app module", function() {
  describe("with valid 'azk app' folder", function() {
    var app_dir = helper.fixture_path('test-app');
    var box_dir = helper.fixture_path('test-box');

    it("should return a new app id", function() {
      var id = App.new_id()
      expect(id).to.have.length(32)
      .and.match(/^[0-9a-f]+$/)
    });

    it("should return a manifest", function() {
      var manifest = path.join(app_dir, azk.cst.MANIFEST);
      expect(App.find_manifest(app_dir)).to.equal(manifest);
    });

    it("should return not found manifest", function() {
      return helper.tmp.dir({ prefix: "azk-" })
      .then(function(dir) {
        expect(App.find_manifest(dir)).to.equal(null);
      });
    });

    describe("and request a new object", function() {
      it("should find manifest and parse then", function() {
        var id  = "25b2946ba8a7459";
        var app = new App(app_dir);

        expect(app).to.have.property("id", id);
        expect(app).to.have.property("repository", "azk/apps/" + id);
        expect(app).to.have.property("image", "azk/apps/" + id + ":latest");
        expect(app).to.have.property("path" , app_dir);
        expect(app).to.have.deep.property("content.box", "../test-box");
        expect(app).to.have.deep.property("from.path", box_dir);
      });

      it("should parse box manifest", function() {
        var id  = "fe0598b51044470";
        var app = new App(box_dir);
        expect(app).to.have.deep.property("from.image", "ubuntu:12.04");
      });
    });
  });
});
