var h      = require('../spec_helper.js');
var path   = require('path');
var docker = require('../../lib/docker');
var App    = require('../../lib/app');
var Agent  = require('../../lib/agent');
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
        var event = ["fail", "command.service.invalid_service", "invalid"]
        h.expect(code).to.equal(3);
        h.expect(events).to.include.something.eql(event);
      });
    });

    it("should down service from 2 to 0 instances", function() {
      this.timeout(10000);
      return Q.async(function* () {
        yield cmd.run(app, out, "web2", "stop", 0);
        yield cmd.run(app, out, "web2", "status");
        yield cmd.run(app, out, "web2", "start", 1);
        yield cmd.run(app, out, "web2", "start", 2);
        yield cmd.run(app, out, "web2", "status");
        yield cmd.run(app, out, "web2", "stop", 0);

        var logs = [
          ['ok', 'commands.service.not_runnig'],
          ['ok', 'commands.service.scale', 0, 1],
          ['ok', 'commands.service.scale', 1, 2],
          ['ok', 'commands.service.running', 2],
          ['ok', 'commands.service.stopping', 2],
        ]

        h.expect(events).to.have.length(11);
        _.each(logs, function(log) {
          h.expect(events).to.include.something.eql(log);
        });
      })();
    });

    it("should register host and backend in proxy", function() {
      this.timeout(5000);
      return Q.async(function* () {
        var backends = [];
        yield Agent.executeRemote('proxy_clear', app.env.alias);

        backends = yield Agent.executeRemote('proxy_list', app.env.alias[0]);
        h.expect(backends).to.be.empty;

        yield cmd.run(app, out, "web", "start", 1);

        backends = yield Agent.executeRemote('proxy_list', app.env.alias[0]);
        h.expect(backends[0]).to.match(/http/);

        yield cmd.run(app, out, "web", "stop", 0);

        backends = yield Agent.executeRemote('proxy_list', app.env.alias[0]);
        h.expect(backends).to.be.empty;
      })();
    });

    it("should balancer request", function() {
      this.timeout(20000);
      return Q.async(function* () {
        var backends = [];
        yield Agent.executeRemote('proxy_clear', app.env.alias);
        yield cmd.run(app, out, "web", "start", 1);

        var result = yield h.request(azk.cst.VM_IP, 80, app.env.alias[0]);
        h.expect(result[0]).to.equal(200);
        h.expect(result[1]).to.match(/Hello, world!/);

        yield cmd.run(app, out, "web", "stop");

        var result = yield h.request(azk.cst.VM_IP, 80, app.env.alias[0]);
        h.expect(result[0]).to.equal(400);
        h.expect(result[1]).to.match(/No Application Configured/);
      })();
    });
  });
});
