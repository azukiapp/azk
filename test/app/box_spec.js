var azk    = require('../../lib/azk');
var Box    = require('../../lib/app/box');
var sha1   = require('../../lib/utils/sha1');
var h      = require('../spec_helper');
var path   = require('path');
var Q      = require('q');

describe("Azk app box", function() {
  it("should support github format", function() {
    var box = new Box("azukiapp/ruby-box#stable");
    h.expect(box).to.have.property("type", "github");
    h.expect(box).to.have.property("origin", "https://github.com/azukiapp/ruby-box");
    h.expect(box).to.have.property("path", "azukiapp/ruby-box");
    h.expect(box).to.have.property("version", "stable");
    h.expect(box).to.have.property("repository", "azukiapp/ruby-box");
    h.expect(box).to.have.property("image", "azukiapp/ruby-box:stable");
  });

  it("should support github format without version", function() {
    var box = new Box("azukiapp/ruby-box");
    h.expect(box).to.have.property("type", "github");
    h.expect(box).to.have.property("origin", "https://github.com/azukiapp/ruby-box");
    h.expect(box).to.have.property("path", "azukiapp/ruby-box");
    h.expect(box).to.have.property("version", "master");
    h.expect(box).to.have.property("repository", "azukiapp/ruby-box");
    h.expect(box).to.have.property("image", "azukiapp/ruby-box:master");
  });

  it("should support path format", function() {
    return h.mock_app().then(function(box_path) {
      var repo     = box_path.replace(/^\//, '').replace(/\/$/, "")
      var hash     = sha1.calculateSync(box_path);

      var box = new Box(box_path);
      h.expect(box).to.have.property("type", "path");
      h.expect(box).to.have.property("origin", null);
      h.expect(box).to.have.property("path", box_path);
      h.expect(box).to.have.property("version", hash);
      h.expect(box).to.have.property("repository", repo);
      h.expect(box).to.have.property("image", repo + ":" + hash);
    });
  });

  it("should return a error if path not found", function() {
    var box_path = path.join(process.cwd(), "novalid")
    var func = function() { new Box(box_path); }
    h.expect(func).to.throw(Error, /box directory.*not found/);
  })

  it("should expand relative path", function() {
    var box_path = h.fixture_path("test-box")
    var repo     = box_path.replace(/^\//, '').replace(/\/$/, "")
    var hash     = sha1.calculateSync(box_path);

    var box = new Box(
      "./" + path.relative(process.cwd(), box_path)
    );

    h.expect(box).to.have.property("type", "path");
    h.expect(box).to.have.property("origin", null);
    h.expect(box).to.have.property("path", box_path);
    h.expect(box).to.have.property("version", hash);
    h.expect(box).to.have.property("repository", repo);
    h.expect(box).to.have.property("image", repo + ":" + hash);
  })

  it("should support docker format", function() {
    var image = azk.cst.DOCKER_DEFAULT_IMG.split(":");
    var box = new Box(azk.cst.DOCKER_DEFAULT_IMG);
    h.expect(box).to.have.property("type", "docker");
    h.expect(box).to.have.property("origin", null);
    h.expect(box).to.have.property("path", null);
    h.expect(box).to.have.property("version", image[1]);
    h.expect(box).to.have.property("repository", image[0]);
    h.expect(box).to.have.property("image", azk.cst.DOCKER_DEFAULT_IMG);
  });

  it("should return erro for invalid box", function() {
    var func = function() { new Box("%%#^%@"); }
    h.expect(func).to.throw(Error, /not a valid/);
  });
});

