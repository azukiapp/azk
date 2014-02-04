var path   = require('path');
var azk    = require('../../lib/azk');
var helper = require('../spec_helper.js');
var Box    = require('../../lib/app/box');
var sha1   = require('../../lib/utils/sha1');
var Q      = require('q');

var expect = helper.expect;

describe("Azk app box", function() {
  it("should support github format", function() {
    var result = Box.parse("azukiapp/ruby-box#stable");
    return Q.all([
      expect(result).to.eventually.have.property("type", "github"),
      expect(result).to.eventually.have.property("origin", "https://github.com/azukiapp/ruby-box"),
      expect(result).to.eventually.have.property("path", "azukiapp/ruby-box"),
      expect(result).to.eventually.have.property("version", "stable"),
      expect(result).to.eventually.have.property("repository", "azukiapp/ruby-box"),
      expect(result).to.eventually.have.property("image", "azukiapp/ruby-box:stable"),
    ]);
  });

  it("should support github format without version", function() {
    var result = Box.parse("azukiapp/ruby-box");
    return Q.all([
      expect(result).to.eventually.have.property("type", "github"),
      expect(result).to.eventually.have.property("origin", "https://github.com/azukiapp/ruby-box"),
      expect(result).to.eventually.have.property("path", "azukiapp/ruby-box"),
      expect(result).to.eventually.have.property("version", "master"),
      expect(result).to.eventually.have.property("repository", "azukiapp/ruby-box"),
      expect(result).to.eventually.have.property("image", "azukiapp/ruby-box:master"),
    ]);
  });

  it("should support path format", function() {
    var box_path = helper.fixture_path("test-box")
    var repo     = box_path.replace(/^\//, '').replace(/\/$/, "")

    return (Q.async(function* () {
      var sha    = yield sha1.calculate(box_path);
      var result = yield Box.parse(box_path);

      expect(result).to.have.property("type", "path");
      expect(result).to.have.property("origin", null);
      expect(result).to.have.property("path", box_path);
      expect(result).to.have.property("version", sha),
      expect(result).to.have.property("repository", repo)
      expect(result).to.have.property("image", repo + ":" + sha)
    }))();
  });

  it("should return a error if path not found", function() {
    var box_path = path.join(process.cwd(), "novalid")

    return expect(Box.parse(box_path))
      .be.rejectedWith(Error, /box directory.*not found/)
  })

  it("should expand relative path", function() {
    var box_path = helper.fixture_path("test-box")
    var repo     = box_path.replace(/^\//, '').replace(/\/$/, "")

    return (Q.async(function* () {
      var sha    = yield sha1.calculate(box_path);
      var result = yield Box.parse(
        "./" + path.relative(process.cwd(), box_path)
      );

      expect(result).to.have.property("type", "path");
      expect(result).to.have.property("origin", null);
      expect(result).to.have.property("path", box_path);
      expect(result).to.have.property("version", sha),
      expect(result).to.have.property("repository", repo)
      expect(result).to.have.property("image", repo + ":" + sha)
    }))();
  })

  it("should support docker format", function() {
    var result = Box.parse("ubuntu:12.04");
    return Q.all([
      expect(result).to.eventually.have.property("type", "docker"),
      expect(result).to.eventually.have.property("origin", null),
      expect(result).to.eventually.have.property("path", null),
      expect(result).to.eventually.have.property("version", "12.04"),
      expect(result).to.eventually.have.property("repository", "ubuntu"),
      expect(result).to.eventually.have.property("image", "ubuntu:12.04"),
    ]);
  });

  it("should return erro for invalid box", function() {
    var result = Box.parse("%%#^%@");
    return expect(result).be.rejectedWith(Error, /not a valid/);
  });
});

