var path   = require('path');
var azk    = require('../../lib/azk');
var helper = require('../spec_helper.js');
var Box    = require('../../lib/app/box');
var sha1   = require('../../lib/utils/sha1');
var Q      = require('q');

var expect = helper.expect;

describe("Azk app box", function() {
  it("should support github format", function() {
    var box = new Box("azukiapp/ruby-box#stable");
    expect(box).to.have.property("type", "github");
    expect(box).to.have.property("origin", "https://github.com/azukiapp/ruby-box");
    expect(box).to.have.property("path", "azukiapp/ruby-box");
    expect(box).to.have.property("version", "stable");
    expect(box).to.have.property("repository", "azukiapp/ruby-box");
    expect(box).to.have.property("image", "azukiapp/ruby-box:stable");
  });

  it("should support github format without version", function() {
    var box = new Box("azukiapp/ruby-box");
    expect(box).to.have.property("type", "github");
    expect(box).to.have.property("origin", "https://github.com/azukiapp/ruby-box");
    expect(box).to.have.property("path", "azukiapp/ruby-box");
    expect(box).to.have.property("version", "master");
    expect(box).to.have.property("repository", "azukiapp/ruby-box");
    expect(box).to.have.property("image", "azukiapp/ruby-box:master");
  });

  it("should support path format", function() {
    var box_path = helper.fixture_path("test-box")
    var repo     = box_path.replace(/^\//, '').replace(/\/$/, "")
    var hash     = sha1.calculateSync(box_path);

    var box = new Box(box_path);
    expect(box).to.have.property("type", "path");
    expect(box).to.have.property("origin", null);
    expect(box).to.have.property("path", box_path);
    expect(box).to.have.property("version", hash);
    expect(box).to.have.property("repository", repo);
    expect(box).to.have.property("image", repo + ":" + hash);
  });

  it("should return a error if path not found", function() {
    var box_path = path.join(process.cwd(), "novalid")
    var func = function() { new Box(box_path); }
    expect(func).to.throw(Error, /box directory.*not found/);
  })

  it("should expand relative path", function() {
    var box_path = helper.fixture_path("test-box")
    var repo     = box_path.replace(/^\//, '').replace(/\/$/, "")
    var hash     = sha1.calculateSync(box_path);

    var box = new Box(
      "./" + path.relative(process.cwd(), box_path)
    );

    expect(box).to.have.property("type", "path");
    expect(box).to.have.property("origin", null);
    expect(box).to.have.property("path", box_path);
    expect(box).to.have.property("version", hash);
    expect(box).to.have.property("repository", repo);
    expect(box).to.have.property("image", repo + ":" + hash);
  })

  it("should support docker format", function() {
    var box = new Box("ubuntu:12.04");
    expect(box).to.have.property("type", "docker");
    expect(box).to.have.property("origin", null);
    expect(box).to.have.property("path", null);
    expect(box).to.have.property("version", "12.04");
    expect(box).to.have.property("repository", "ubuntu");
    expect(box).to.have.property("image", "ubuntu:12.04");
  });

  it("should return erro for invalid box", function() {
    var func = function() { new Box("%%#^%@"); }
    expect(func).to.throw(Error, /not a valid/);
  });
});

