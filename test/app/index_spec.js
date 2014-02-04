var helper = require('../spec_helper.js');
var App    = require('../../lib/app');
var path   = require('path');
var fs     = require('q-io/fs');

var azk    = helper.azk;
var expect = helper.expect;

var Q = azk.Q;

describe("Azk app", function() {
  describe("with valid 'azk app' folder", function() {
    var app_dir = null;
    var box_dir = null;

    before(function() {
      return helper.tmp.dir({ prefix: "azk-" })
      .then(function(dir) {
        var old = process.cwd();
        process.chdir(dir);
        dir     = process.cwd();
        process.chdir(old);

        app_dir = path.join(dir, "app");
        box_dir = path.join(dir, "test-box");

        return Q.all([
          fs.makeDirectory(app_dir),
          fs.copyTree(helper.fixture_path('test-box'), box_dir),
          fs.copy(
            helper.fixture_path('full_azkfile.json'),
            path.join(app_dir, azk.cst.MANIFEST)
          )
        ])
      });
    });

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

    });
  });
});
