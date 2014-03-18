var h      = require('../spec_helper.js');
var path   = require('path');
var docker = require('../../lib/docker');
var App    = require('../../lib/app');
var cmd    = require('../../lib/commands/kill');
var exec   = require('../../lib/commands/exec');

var azk = h.azk;
var Q   = azk.Q;
var _   = azk._;

describe("Azk kill command", function() {
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

  it("should kill a interactive command", function() {
    var container = null;
    var stdin = new h.MemoryStream();
    var out   = {
      log: function(_, type, id) {
        if (type == "wait") {
          stdin.write("uname\n");
          setTimeout(function() {
            cmd.run(app, out, id.slice(0, 12));
          }, 1000);
        }
      }
    }

    var result = exec.run(app, out, ["/bin/bash"], {
      interactive: true,
      stdin: stdin, stdout: mocks.stdout, stderr: mocks.stderr
    });

    return result.then(function(code) {
      h.expect(code).to.equal(-1);
      h.expect(outputs.stdout).to.match(/Linux/);
    });
  });
});
