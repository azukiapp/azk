var h   = require('../spec_helper.js');
var cli = require('../../lib/cli');
var App = require('../../lib/app');

var azk = h.azk;
var Q   = azk.Q;
var _   = azk._;

describe("Azk cli helpers", function() {
  var events = [];
  var capture_evs = function(event) {
    events.push(event);
  }

  beforeEach(function() {
    events = [];
  });

  it("return error if azkfile.json not found", function() {
    return h.tmp.dir().then(function(tmp) {
      var result = cli.helpers.run({
        cwd: tmp,
      });

      return result.progress(capture_evs)
      .fail(function(code) {
        var msg   = azk.t("app.manifest.not_found", azk.cst.MANIFEST);
        var event = { type: "fail", msg: msg };
        h.expect(code).to.equal(1);
        h.expect(events).to.include.something.deep.equal(event);
      });
    });
  });

  describe("with a valid app dir", function() {
    var app = null;

    before(function() {
      return h.mock_app().then(function(dir) {
        app = new App(dir);
      });
    });

    it("should return error if not provision image", function() {
      return Q.async(function* () {
        yield h.remove_images(app.image);

        var result = cli.helpers.run({
          cwd: app.path,
        });

        result = result.progress(capture_evs);
        result = result.fail(function(code) {
          var msg   = azk.t("app.image.not_provision", app.image);
          var event = { type: "fail", msg: msg };
          h.expect(code).to.equal(2);
          h.expect(events).to.include.something.deep.equal(event);
        });

        return yield result;
      })();
    });

    describe("and provisioned app image", function() {

      before(function() {
        return app.provision({ force: true }, new h.MemoryStream());
      });

      it("should run the posted promise", function() {
        return Q.async(function* () {
          var result = cli.helpers.run({ cwd: app.path }, function(app, out) {
            out.log(app.image);
            out.fail(app.image);
            out.ok(app.image);
            return 10;
          });

          result = result.progress(capture_evs).then(function(code) {
            h.expect(code).to.equal(10);
            h.expect(events).to.include.something.deep
              .equal({ type: "log", msg: app.image });
            h.expect(events).to.include.something.deep
              .equal({ type: "fail", msg: app.image });
            h.expect(events).to.include.something.deep
              .equal({ type: "ok", msg: app.image });
          })

          yield result;
        })()
      });

      it("should run, log and return error", function() {
        return h.capture_io(function() {
          var done = Q.defer();

          process.once("azk:command:exit", function(code) {
            done.resolve(code);
          });

          process.env.AZK_DEBUG = "azk:*";
          cli.helpers.run_with_log("helpers", { cwd: app.path}, function(app, out) {
            out.log("%s", app.image);
            out.fail("%s", app.image);
            out.ok("%s", app.image);
            return 10;
          });

          return done.promise;
        }).then(function(result) {
          var outputs = result[1];

          var exp = h.escapeRegExp("azk".blue + ": " + app.image);
          h.expect(outputs.stdout).to.match(RegExp(exp));

          var exp = h.escapeRegExp("azk:error".red + " " + app.image);
          h.expect(outputs.stderr).to.match(RegExp(exp));

          var exp = "azk:helpers.*" + app.image;
          h.expect(outputs.stderr).to.match(RegExp(exp));
        });
      });
    });
  });
});
