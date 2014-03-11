var h      = require('../spec_helper');
var path   = require('path');
var docker = require('../../lib/docker');
var App    = require('../../lib/app');
var cmd    = require('../../lib/commands/provision');

var azk = h.azk;
var Q   = azk.Q;
var _   = azk._;

describe("Azk provision command", function() {
  this.timeout(0);
  var events, out, outputs = {};

  var mocks = h.mock_outputs(beforeEach, outputs, function() {
    events = [];
    out = h.capture_evs(events);
  });

  describe("in valid app dir", function() {
    var app;

    beforeEach(function() {
      return h.mock_app().then(function(dir) {
        app = new App(dir);
      });
    });

    it("should provision image", function() {
      var result = cmd.run(app, out, { cache: false, stdout: mocks.stdout });

      return result.then(function(code) {
        h.expect(code).to.equal(0);
        var event = ["log", "app.image.provisioned", app.image];
        h.expect(events).to.include.something.deep.equal(event);
        h.expect(outputs.stdout).to.match(RegExp("FROM " + app.from.image));
      });
    });

    it("should not reprovision", function() {
      var pre = app.provision({}, new h.MemoryStream());

      return pre.then(function() {
        var result = cmd.run(app, out, { cache: false, stdout: mocks.stdout });
        return result.fail(function(code) {
          h.expect(code).to.equal(1);
          var event = ["fail", "app.image.already", app.image];
          h.expect(events).to.include.something.deep.equal(event);
        });
      });
    });

    it("should reprovision if forced", function() {
      var pre = app.provision({}, new h.MemoryStream());

      return pre.then(function() {
        var result = cmd.run(app, out, { cache: false, force: true, stdout: mocks.stdout });
        return result.then(function(code) {
          h.expect(code).to.equal(0);
          var event = ["log", "commands.provision.removing", app.image];
          h.expect(events).to.include.something.deep.equal(event);
          var event = ["log", "app.image.provisioned", app.image];
          h.expect(events).to.include.something.deep.equal(event);
          h.expect(outputs.stdout).to.match(RegExp("FROM " + app.from.image));
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
      var result = cmd.run(app, out, { cache: false, force: true, stdout: mocks.stdout });

      return result.then(function(code) {
        h.expect(code).to.equal(0);
        var event = ["log", "app.image.provisioned", app.image];
        h.expect(events).to.include.something.deep.equal(event);
        var event = ["log", "app.image.provisioned", app.from.image];
        h.expect(events).to.include.something.deep.equal(event);
        h.expect(outputs.stdout).to.match(RegExp("FROM " + app.from.image));
        h.expect(outputs.stdout).to.match(RegExp("FROM " + ancestor.from.image));
      });
    });
  });
});
