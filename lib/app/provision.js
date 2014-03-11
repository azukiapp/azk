var azk      = require('../azk');
var docker   = require('../docker');
var archiver = require('archiver');
var fs       = require('fs');
var path     = require('path');

var errors = azk.errors;
var Q = azk.Q;
var _ = azk._;

function add_path(source, dest, archive, relative) {
  var name = source;
  var file = path.join(relative, source)

  if (fs.existsSync(file)) {
    var stream = fs.createReadStream(file);
    archive.append(stream, { name: name });
    return "ADD " + source + " " + dest;
  }
  throw new errors.InvalidFileError(source);
}

function format_run(cmds) {
  var line = ["RUN"]
  _.each(cmds, function(cmd) {
    if (cmd.match(/\s/)) {
      line.push('"' + cmd.replace(/"/g, '\\"') + '"');
    } else {
      line.push(cmd);
    }
  });

  return line.join(" ");
}

function provision(from, image, directory, output, opts) {
  return Q.async(function* () {
    var f_image = yield docker.getImage(from);
    var data  = yield f_image.inspect();

    opts = _.extend({
      verbose: false,
      cache: true,
    }, opts);
    var archive = archiver('tar');

    // Steps
    var data = [ "FROM " + from ];

    _.each(opts.steps || [], function(step) {
      if (typeof(step) == "string") {
        return data.push("RUN " + step);
      }

      switch (step[0]) {
        case "run":
          data.push(format_run(step[1]));
          break;
        case "add":
          data.push(add_path(step[1], step[2], archive, directory));
          break;
      }
    });

    archive.append(data.join("\n"), { name: "Dockerfile" });
    archive.finalize(function() {});

    var done   = Q.defer();
    var b_opts = { t: image, nocache: !opts.cache, q: !opts.verbose }
    var stream = yield docker.buildImage(archive, b_opts);

    if (output) {
      stream.on("data", function(data) {
        try {
          var msg = JSON.parse(data);
        } catch (e) {
          var msg = { error: e }
        }
        output.write(msg.stream || msg.error);
      });
    }

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
