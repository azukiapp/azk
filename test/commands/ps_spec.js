var path    = require('path');
var h       = require('../spec_helper.js');
var docker  = require('../../lib/docker');
var App     = require('../../lib/app');
var cli     = require('../../lib/cli');
var cmd     = require('../../lib/commands/ps');
var exec    = require('../../lib/commands/exec');
var service = require('../../lib/commands/service');

var azk = h.azk;
var Q   = azk.Q;
var _   = azk._;

describe("Azk ps command", function() {
  var app = null;
  var events = [];
  var out = h.capture_evs(events);

  before(function() {
    return h.mock_app().then(function(dir) {
      app = new App(dir);
    });
  });

  // TODO: implement tests
  describe("in a provisioned app", function() {
    before(function() {
      return Q.async(function* () {
        yield app.provision({ force: true }, new h.MemoryStream());
        yield service.run(app, out, "web2", "stop");
        yield service.run(app, out, "web2", "start", 2);
      })();
    });

    after(function() {
      return service.run(app, out, "web2", "stop");
    });

    it("should list services", function() {
      return cmd.run(app, out);
    });
  });
});
