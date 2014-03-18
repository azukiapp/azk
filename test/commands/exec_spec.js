var h      = require('../spec_helper.js');
var path   = require('path');
var docker = require('../../lib/docker');
var App    = require('../../lib/app');
var cmd    = require('../../lib/commands/exec');

var azk = h.azk;
var Q   = azk.Q;
var _   = azk._;

describe("Azk exec command", function() {
  this.timeout(0);
  var app = null;
  var events, out, outputs = {};

  var mocks = h.mock_outputs(beforeEach, outputs, function() {
    events = [];
    out = h.capture_evs(events);
  });

  before(function() {
    return h.mock_app().then(function(dir) {
      app = new App(dir);
      return app.provision({ force: true }, new h.MemoryStream());
    });
  });

  it("should execute a interactive command", function() {
    var stdin  = new h.MemoryStream();
    var out    = {
      log: function(_, type) {
        if (type == "wait")
          stdin.write("uname\nexit\n");
      }
    }

    var result = cmd.run(app, out, ["/bin/bash"], {
      interactive: true,
      stdin: stdin, stdout: mocks.stdout, stderr: mocks.stderr,
    });

    return result.then(function(code) {
      h.expect(code).to.equal(0);
      h.expect(outputs.stdout).to.match(/Linux/);
    });
  });

  it("should mount app directory", function() {
    var args   = ["/bin/bash", "-c", "cat /azk/app/azkfile.json"];
    var result = cmd.run(app, out, args, {
      stdout: mocks.stdout, stderr: mocks.stderr
    });

    return result.then(function(code) {
      h.expect(code).to.equal(0);
      h.expect(outputs.stdout).to.match(/ENVS_ENV_VAR/);
    });
  });

  it("should return result code", function() {
    var args   = ["/bin/bash", "-c", "exit 127"];
    var result = cmd.run(app, out, args, {});

    return result.then(function(code) {
      h.expect(code).to.equal(127);
    });
  });
});
