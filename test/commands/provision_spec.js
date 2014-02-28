var h      = require('../spec_helper');
var path   = require('path');
var docker = require('../../lib/docker');
var App    = require('../../lib/app');

var azk = h.azk;
var Q   = azk.Q;
var _   = azk._;

describe("Azk provision command", function() {
  var outputs = { };
  var mocks   = h.mock_outputs(beforeEach, outputs);
  var exec    = h.mock_exec(mocks, "provision");

  it("should return error if manifest not found", function() {
    return h.tmp.dir().then(function(tmp) {
      var result = exec(tmp, []);

      return result.then(function(code) {
        var msg = azk.t("app.manifest.not_found", azk.cst.MANIFEST);

        h.expect(code).to.equal(1);
        h.expect(outputs.stderr).to.match(RegExp(msg));
      });
    });
  });

  describe("in valid app dir", function() {
    this.timeout(10000);
    var app;

    beforeEach(function() {
      return h.mock_app().then(function(dir) {
        app = new App(dir);
      });
    });

    it("should provision image", function() {
      return exec(app.path, ["--no-cache"]).then(function(code) {
        var msg = azk.t("app.image.provisioned", app.image);

        h.expect(code).to.equal(0);
        h.expect(outputs.stderr).to.match(RegExp(msg));
        h.expect(outputs.stdout).to.match(RegExp("FROM " + app.from.image));
      });
    });

    it("should not reprovision", function() {
      var pre = app.provision({}, new h.MemoryStream());

      return pre.then(function() {
        return exec(app.path, []).then(function(code) {
          var msg = azk.t("app.image.already", app.image);

          h.expect(code).to.equal(1);
          h.expect(outputs.stderr).to.match(RegExp(msg));
        });
      });
    });

    it("should reprovision if forced", function() {
      var pre = app.provision({}, new h.MemoryStream());

      return pre.then(function() {
        return exec(app.path, ["--force"]).then(function(code) {
          var msg = azk.t("app.image.provisioned", app.image);

          h.expect(code).to.equal(0);
          h.expect(outputs.stderr).to.match(RegExp(msg));
          h.expect(outputs.stdout).to.match(RegExp("FROM " + app.from.image));

          var msg = azk.t("commands.provision.removing", app.image);
          h.expect(outputs.stderr).to.match(RegExp(msg));
        });
      });
    });
  });

  describe("have an ancestor unprovisioned", function() {
    var ancestor, app;

    beforeEach(function() {
      return h.mock_app().then(function(dir) {
        ancestor = new App(dir);

        return h.mock_app({ box: dir }).then(function(dir) {
          app = new App(dir);
        });
      });
    });

    it("should provision all", function() {
      return exec(app.path, ["--no-cache"]).then(function(code) {
        h.expect(code).to.equal(0);

        var msg = azk.t("app.image.provisioned", app.image);
        h.expect(outputs.stderr).to.match(RegExp(msg));

        var msg = azk.t("app.image.provisioned", app.from.image);
        h.expect(outputs.stderr).to.match(RegExp(msg));

        h.expect(outputs.stdout).to.match(
          RegExp("FROM " + ancestor.from.image));
        h.expect(outputs.stdout).to.match(
          RegExp("FROM " + ancestor.from.image));
      });
    });
  });
});
