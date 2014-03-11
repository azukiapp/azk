var qfs    = require('q-io/fs');
var path   = require('path');
var azk    = require('../azk');
var App    = require('../app');
var docker = require('../docker');
var printf = require('printf');

var Q = azk.Q;
var S = azk.utils.S;
var _ = azk._;

var helpers = module.exports = {};

helpers.require_app = function(dir) {
  return Q.when(null, function() {
    var app = new App(dir);

    if (!app.file) {
      azk.fail(
        azk.t("app.manifest.not_found", azk.cst.MANIFEST)
      );
      return S.return(1);
    }

    return app;
  });
}

helpers.image_not_found = function(image) {
  azk.fail(azk.t("app.image.not_provision", image))
  return helpers.exit(2);
}

helpers.prepare_app = function(app) {
  return qfs.makeTree(app.log.path).then(function() {
    // Default volumes
    var volumes = {};
    volumes[app.path] = "/azk/app";
    volumes[app.log.path] = "/azk/logs";

    return {
      ports: {},
      volumes: volumes,
      working_dir: volumes[app.path],
      env: app.env.env
    }
  });
}

helpers.exit = function(code) {
  process.emit("azk:command:exit", code);
}

helpers.spwan = function(func) {
  return S.stoppable(Q.async(func)()).then(function(code) {
    helpers.exit(code);
  }, function(err) {
    console.error(err.stack);
    helpers.exit(1);
  });
}

helpers.out_proto = function(proto, notify) {
  return function() {
    var args = _.toArray(arguments);
    var msg  = (args[0].match(/%/)) ?
      printf.apply(null, args) : azk.t.apply(null, args)
    notify({ type: proto, msg: msg });
  }
}

helpers.run = function(opts, func) {
  var done  = Q.defer();
  var funcs = [];
  var out   = {
    log  : this.out_proto("log", done.notify),
    ok   : this.out_proto("ok", done.notify),
    fail : this.out_proto("fail", done.notify)
  }

  // Init
  funcs.push(null);

  // Manifest find
  if (!opts.skip_app) {
    funcs.push(function() {
      var app = new App(opts.cwd);

      if (!app.file) {
        out.fail("app.manifest.not_found", azk.cst.MANIFEST);
        throw 1;
      }

      return app;
    });
  }

  // Image check
  if ((!opts.skip_app) && (!opts.skip_image)) {
    funcs.push(function(app) {
      return docker.findImage(app.image).then(function(data) {

        if (!data) {
          out.fail("app.image.not_provision", app.image);
          throw 2;
        }

        return app;
      })
    });
  }

  // Main
  funcs.push(function(app) {
    return func(app, out) //.fail(done.reject);
  });

  // Connect and return
  funcs.reduce(Q.when, Q()).then(done.resolve, done.reject);
  return done.promise;
}

helpers.run_with_log = function(service, opts, func) {
  helpers.run(opts, func)
    .progress(function(event) {
      switch(event.type) {
        case 'log':
          azk.debug("azk:" + service)(event.msg);
          break;
        case 'ok':
          azk.ok(event.msg);
          break;
        case 'fail':
          azk.fail(event.msg);
          break;
      }
    })
    .then(helpers.exit, function(err) {
      if (typeof(err) == "number") {
        helpers.exit(err);
      } else {
        console.log(err.stack);
      }
    });
}
