var h      = require('../spec_helper.js');
var path   = require('path');
var docker = require('../../lib/docker');
var App    = require('../../lib/app');
var cli    = require('../../lib/cli');
var cmd    = require('../../lib/commands/service');

var azk = h.azk;
var Q   = azk.Q;
var _   = azk._;

describe("Azk service command", function() {
  var app = null;
  var events = [];
  var out = h.capture_evs(events);

  before(function() {
    return h.mock_app().then(function(dir) {
      app = new App(dir);
    });
  });

  describe("in a provisioned app", function() {
    before(function() {
      return app.provision({ force: true }, new h.MemoryStream());
    });

    it("should return error if not valid service", function() {
      var result = cmd.run(app, out, "invalid", "status");

      return result.fail(function(code) {
        h.expect(code).to.equal(3);
        h.expect(events).to.include.something.eql(["fail", "command.service.invalid_service", "invalid"]);
      });
    });

    it("should down service from 2 to 0 instances", function() {
      this.timeout(10000);
      return Q.async(function* () {
        yield cmd.run(app, out, "web2", "stop");
        yield cmd.run(app, out, "web2", "status");
        yield cmd.run(app, out, "web2", "start", 1);
        yield cmd.run(app, out, "web2", "start", 2);
        yield cmd.run(app, out, "web2", "status");
        yield cmd.run(app, out, "web2", "stop", 0);

        var logs = [
          ['ok', 'commands.service.not_runnig'],
          ['log', 'commands.service.scale', 0, 1],
          ['log', 'commands.service.scale', 1, 2],
          ['ok', 'commands.service.running', 2],
          ['log', 'commands.service.stopping', 2],
        ]

        _.each(logs, function(log) {
          h.expect(events).to.include.something.eql(log);
        });
      })();
    });
  });
});
