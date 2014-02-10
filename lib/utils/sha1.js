var qfs     = require('q-io/fs');
var azk     = require('../azk');
var crypto  = require('crypto');
var glob    = require('glob');
var path    = require('path');
var moment  = require('moment');
var fs      = require('fs');

var archiver = require('archiver');

var Q = azk.Q;
var _ = azk._;

function calculate_hash(stats) {
  var shasum = crypto.createHash('sha1');

  var newest = _.max(stats, function(stat) {
    return moment(stat.mtime).valueOf();
  });

  shasum.update(moment(newest.mtime).valueOf().toString());
  return shasum.digest('hex');
}

module.exports = {
  calculate: function(source) {
    return qfs.stat(source).then(function(stat) {
      if (stat.isDirectory()) {
        var done = Q.defer();

        var g = glob("**/*", { stat: true, cwd: source });
        g.on("end", function() {
          var hash = calculate_hash(this.statCache);
          done.resolve(hash);
        });

        return done.promise;
      }
      throw new Error("Source %s not is a directory", source);
    });
  },

  calculateSync: function(source) {
    var files = glob.sync("**/*", { stat: true, cwd: source });
    var stats = _.map(files, function(file) {
      return fs.statSync(path.join(source, file));
    });

    return calculate_hash(stats);
  }
}
