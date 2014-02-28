var azk    = require('../azk');
var App    = require('../app');
var docker = require('../docker');
var path   = require('path');
var debug  = require('debug')('azk:provision');
var provision = require('./provision');
var exec   = require('child_process').exec;

var Q = azk.Q;
var _ = azk._;
var cst = azk.cst;

function pull(repository, tag, stdout) {
  var done  = Q.defer();
  var image = repository + ':' + tag;

  docker.createImage({
    fromImage: repository,
    tag: tag,
  })
  .then(function(stream) {
    stream.on('data', function(data) {
      var msg = JSON.parse(data.toString());
      if (msg.error && msg.error.match(/404/)) {
        done.reject(new azk.errors.ProvisionNotFound(image));
      } else {
        stdout.write(msg.status + "\n");
      }
    });

    stream.on('end', function() {
      done.resolve(image);
    });
  })
  .fail(done.reject);

  return done.promise;
}

var git = path.join(__dirname, '..', 'libexec', 'azk-git');
function clone(repository, checkout, dest) {
  var cmd = [git, repository, dest, checkout];
  return Q.nfcall(exec, cmd.join(' '));
}

function getImage(image) {
  return docker.getImage(image).inspect()
    .fail(function(err) {
      if (err.statusCode == 404)
        return null;
      throw err;
    });
}

var run = module.exports = function(box, opts, stdout) {
  var done = Q.defer();
  opts   = opts || {};
  stdout = stdout || process.stdout;

  Q.async(function* () {
    var data = null;

    if (!opts.force)
      data = yield getImage(box.image);

    if (!data) {
      if (box.type == "docker") {
        return yield pull(box.repository, box.version, stdout);
      } else {
        if (box.type == "github") {
          box.path = path.join(cst.AZK_CLONE_PATH, box.path);
          yield clone(box.origin, box.version, box.path);
        }

        // Convert box in app
        var app;

        if (!box.from) {
          app = new App(box.path);
          _.extend(app, box);
        } else {
          app = box;
        }

        // Check dependence (from)
        var dep = yield getImage(app.from.image);
        if (dep == null && opts.force) {
          var image = yield run(app.from, opts, stdout)
            .progress(done.notify);
          if (! typeof(image) == "string")
            return 2;
        } else if (dep == null) {
          return 1;
        }

        yield provision(
          app.from.image, app.image, app.path, stdout,
          {steps: app.steps, verbose: true, cache: opts.cache }
        );

        done.notify({ type: "provisioned", image: app.image});
      }
    }

    return box.image;
  })()
  .then(done.resolve)
  .fail(done.reject);

  return done.promise;
}
