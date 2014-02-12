var h      = require('../spec_helper.js');
var docker = require('../../lib/docker');
var Box    = require('../../lib/app/box');
var App    = require('../../lib/app');
var MemoryStream = require('memorystream');

var provision_box = require('../../lib/app/provision_box');

var azk    = h.azk;
var expect = h.expect;
var Q      = azk.Q;

describe("Azk box provision from", function() {
  this.timeout(0);
  var outputs = { };
  var mocks   = h.mock_outputs(beforeEach, outputs);

  it("should raise error an not found docker image", function() {
    var box = new Box("azk:test-box-provision");
    var result = provision_box(box, {}, mocks.stdout);
    return expect(result).to.eventually.rejectedWith(
      azk.errors.ProvisionNotFound, /docker image/
    ).notify(function() {
      expect(outputs.stdout).to.match(/Pulling repository azk/);
    });
  });

  it("should provision a docker image", function() {
    var box = new Box("ubuntu:12.04");
    var result = provision_box(box, { force: true }, mocks.stdout);

    return expect(result)
      .to.eventually.equal(box.image)
      .notify(function() {
        expect(outputs.stdout).to.match(/Pulling repository azk/);
        expect(outputs.stdout).to.match(/Download complete/);
      });
  });

  it("should provision a local repository", function() {
    return (Q.async(function* () {
      var box_dir = yield h.mock_app({
        build: [ "echo None script" ]
      });
      var box     = new Box(box_dir);
      var image   = yield provision_box(box, { force: true }, mocks.stdout);

      expect(image).to.equal(box.image);
      expect(outputs.stdout).to.match(/Step 0 : FROM ubuntu:12\.04/);
      expect(outputs.stdout).to.match(/None script/);

      var data = yield docker.getImage(box.image).inspect();
      expect(data).to.have.property("id");
    }))();
  });

  describe("a git repository", function() {
    var repo;

    before(function() {
      return (Q.async(function* () {
        repo = yield h.mock_app({
          __git: true,
          build: [ "echo None script" ]
        });
      }))();
    });

    it("should get and provision repository", function() {
      var box = new Box("azukiapp/azk-test-#master");
      box.origin  = repo;

      return (Q.async(function* () {
        var opts  = { force: true, cache: false };
        var image = yield provision_box(box, opts, mocks.stdout);

        expect(image).to.equal(box.image);
        expect(outputs.stdout).to.match(/Step 0 : FROM ubuntu:12\.04/);
        expect(outputs.stdout).to.match(/None script/);

        var data = yield docker.getImage(box.image).inspect();
        expect(data).to.have.property("id");
      }))();
    });
  });

  it("should not provision if image exist", function() {
    var box = new Box("ubuntu:12.04");

    return (Q.async(function* () {
      var image = yield provision_box(box, {}, mocks.stdout);

      expect(image).to.equal("ubuntu:12.04");
      expect(outputs.stdout).to.not.match(/Pulling repository azk/);
      expect(outputs.stdout).to.not.match(/Download complete/);
    }))();
  });

  describe("not have image dependence", function() {
    var ancestor, app;

    beforeEach(function() {
      return h.mock_app().then(function(dir) {
        ancestor = new App(dir);

        var data = { box: dir, build: [ "echo None script" ] };
        return h.mock_app(data).then(function(dir) {
          app = new App(dir);
        });
      });
    });

    it("should return a error if dependece imagem is not satisfied", function() {
      var box = new Box(ancestor.path);
      box.from = { image: "azk:invalid" };

      return (Q.async(function* () {
        var image = yield provision_box(box, { force: false }, mocks.stdout);
        expect(image).to.equal(1);
      }))();
    });

    it("should recursive provision if dependence is forced", function() {
      return (Q.async(function* () {
        var image = yield provision_box(app, { force: true }, mocks.stdout);
        var from  = h.escapeRegExp(app.from.image)

        expect(image).to.equal(app.image);
        expect(outputs.stdout).to.match(RegExp("Step 0 : FROM " + from));
        expect(outputs.stdout).to.match(/Step 0 : FROM ubuntu:12\.04/);
        expect(outputs.stdout).to.match(/None script/);
      }))();
    });
  });
});
