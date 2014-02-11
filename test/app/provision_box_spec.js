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
//describe.only("Azk box provision from", function() {
  this.timeout(10000);
  var stdout, output;

  beforeEach(function(done) {
    stdout = new MemoryStream();
    output = '';
    stdout.on('data', function(data) {
      output += data.toString();
    });
    process.nextTick(done);
  });

  it("should raise error an not found docker image", function() {
    var box = new Box("azk:test-box-provision");
    var result = provision_box(box, {}, stdout);
    return expect(result).to.eventually.rejectedWith(
      azk.errors.ProvisionNotFound, /docker image/
    ).notify(function() {
      expect(output).to.match(/Pulling repository azk/);
    });
  });

  it("should provision a docker image", function() {
    var box = new Box("ubuntu:12.04");
    var result = provision_box(box, { force: true }, stdout);

    return expect(result)
      .to.eventually.equal(box.image)
      .notify(function() {
        expect(output).to.match(/Pulling repository azk/);
        expect(output).to.match(/Download complete/);
      });
  });

  it("should provision a local repository", function() {
    var box = new Box(h.fixture_path("test-box"));

    return (Q.async(function* () {
      var image = yield provision_box(box, { force: true }, stdout);

      expect(image).to.equal(box.image);
      expect(output).to.match(/Step 0 : FROM ubuntu:12\.04/);
      expect(output).to.match(/None script/);

      var data = yield docker.getImage(box.image).inspect();
      expect(data).to.have.property("id");
    }))();
  });

  describe("a git repository", function() {
    var repo;

    before(function() {
      return h.tmp.dir()
      .then(function(tmp) {
        return h.make_git_repo(h.fixture_path("test-box"), tmp);
      })
      .then(function(new_repo) {
        repo = new_repo;
      });
    });

    it("should get and provision repository", function() {
      var box = new Box("azukiapp/test-box#master");
      box.origin  = repo;

      return (Q.async(function* () {
        var opts  = { force: true, cache: false };
        var image = yield provision_box(box, opts, stdout);

        expect(image).to.equal(box.image);
        expect(output).to.match(/Step 0 : FROM ubuntu:12\.04/);
        expect(output).to.match(/None script/);

        var data = yield docker.getImage(box.image).inspect();
        expect(data).to.have.property("id");
      }))();
    });
  });

  it("should not provision if image exist", function() {
    var box = new Box("ubuntu:12.04");

    return (Q.async(function* () {
      var image = yield provision_box(box, {}, stdout);

      expect(image).to.equal("ubuntu:12.04");
      expect(output).to.not.match(/Pulling repository azk/);
      expect(output).to.not.match(/Download complete/);
    }))();
  });

  describe("not have image dependence", function() {
    var app = new App(h.fixture_path("test-app"));

    beforeEach(function() {
      return Q.all([
        docker.getImage(app.image).remove(),
        docker.getImage(app.from.image).remove(),
      ])
      .fail(function(err) {
        if (err.statusCode == 404)
          return null;
        throw err;
      });
    });

    it("should return a error if dependece imagem is not satisfied", function() {
      var box = new Box(h.fixture_path("test-box"));
      box.from = { image: "azk:invalid" };

      return (Q.async(function* () {
        var image = yield provision_box(box, { force: false }, stdout);
        expect(image).to.equal(1);
      }))();
    });

    it("should recursive provision if dependence is forced", function() {
      var app = new App(h.fixture_path("test-app"));

      return (Q.async(function* () {
        var image = yield provision_box(app, { force: true }, stdout);
        var from  = h.escapeRegExp(app.from.image)

        expect(image).to.equal(app.image);
        expect(output).to.match(RegExp("Step 0 : FROM " + from));
        expect(output).to.match(/Step 0 : FROM ubuntu:12\.04/);
        expect(output).to.match(/None script/);
      }))();
    });
  });
});
