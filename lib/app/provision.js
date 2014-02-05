var azk      = require('../azk');
var docker   = require('../docker');
var archiver = require('archiver');

var errors = azk.errors;
var Q = azk.Q;
var _ = azk._;

function provision(from, image, output, opts) {
  return Q.async(function* () {
    var f_image = yield docker.getImage(from);
    var data  = yield f_image.inspect();

    var archive = archiver('tar');

    // Steps
    var data = [ "FROM " + from ];

    _.each(opts.steps || [], function(step) {
      data.push("RUN " + step);
    });

    archive.append(data.join("\n"), { name: "Dockerfile" });
    archive.finalize(function() {});

    var done = Q.defer();
    var stream = yield docker.buildImage(archive, { t: image, q: true });

    stream.on("data", function(data) {
      var msg = JSON.parse(data);
      output.write(msg.stream || msg.error);
    });

    stream.on("end", function() {
      done.resolve();
    });

    return done.promise;
  })()
  .fail(function(err) {
    if (err.message.match(/HTTP code is 404/)) {
      err = new errors.ImageNotExistError(from);
    }
    throw err
  });
}

module.exports = provision;
