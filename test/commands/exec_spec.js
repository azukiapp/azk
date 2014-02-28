var h      = require('../spec_helper.js');
var path   = require('path');
var docker = require('../../lib/docker');
var App    = require('../../lib/app');

var azk = h.azk;
var Q   = azk.Q;
var _   = azk._;

describe("Azk exec command", function() {
  var app = null;

  before(function() {
    return h.mock_app().then(function(dir) {
      app = new App(dir);
    });
  });

  var outputs = { };
  var mocks   = h.mock_outputs(beforeEach, outputs);
  var exec    = h.mock_exec(mocks, "exec");

  it("should execute and return error if azkfile.json not found", function() {
    return h.tmp.dir().then(function(tmp) {
      var result = exec(tmp, ["/bin/true"]);

      return result.then(function(code) {
        var msg = azk.t("app.manifest.not_found", azk.cst.MANIFEST);

        h.expect(code).to.equal(1);
        h.expect(outputs.stderr).to.match(RegExp(msg));
      });
    });
  });

  it("should return error if not provision image", function() {
    return h.remove_images(app.image).then(function() {
      var result = exec(app.path, ["/bin/true"]);

      return result.then(function(code) {
        var msg = azk.t("app.image.not_provision", app.image);

        h.expect(code).to.equal(2);
        h.expect(outputs.stderr).to.match(RegExp(msg));
      });
    });
  });

  describe("in a provisioned app", function() {
    this.timeout(0);

    before(function() {
      return app.provision({ force: true }, new h.MemoryStream());
    });

    it("should execute a command and remove a container", function() {
      var result = exec(app.path, ["/bin/bash", "-c", "ls -l"])
      .then(function(code) {
        var stderr = outputs.stderr;
        var regex  = /azk:exec created: (.*)/;
        var id     = stderr.match(regex)[1];

        h.expect(stderr).to.match(regex);
        h.expect(id).to.match(/[0-9a-f]{64}/);

        return docker.getContainer(id).remove();
      });

      return h.expect(result)
        .to.eventually.rejectedWith(/404/);
    });

    it("should execute a command and not remove a container", function() {
      var cmd = ["-R", "/bin/bash", "-c", "ls -l"];

      return exec(app.path, cmd).then(function(code) {
        var stderr = outputs.stderr;
        var regex  = /azk:exec created: (.*)/;
        var id     = stderr.match(regex)[1];

        h.expect(stderr).to.not.match(/removing container/);
        h.expect(stderr).to.match(regex);
        h.expect(id).to.match(/[0-9a-f]{64}/);

        return docker.getContainer(id).remove();
      });
    });

    it("should execute a interative command", function() {
      var cmd = ["-i", "/bin/bash"];
      var stdin = ["uptime", "exit"];

      return exec(app.path, cmd, stdin).then(function(code) {
        h.expect(outputs.stdout).to.match(/.*users.*load average.*/);
      });
    });

    it("should mount app directory", function() {
      var cmd = ["/bin/bash", "-c", "cat /azk/app/azkfile.json"];

      return exec(app.path, cmd).then(function(code) {
        h.expect(code).to.equal(0);
        h.expect(outputs.stdout).to.match(RegExp(app.id));
      });
    });
  });
});
