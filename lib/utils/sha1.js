var fs      = require('q-io/fs');
var azk     = require('../azk');
var crypto  = require('crypto');
var glob    = require('glob');
var path    = require('path');
var moment  = require('moment');

var archiver = require('archiver');

var Q = azk.Q;
var _ = azk._;

module.exports = {
  calculate: function(source) {
    return fs.stat(source).then(function(stat) {
      if (stat.isDirectory()) {
        var deferred = Q.defer();

        var g = glob("**/*", { stat: true, cwd: source });
        g.on("end", function() {
          var shasum = crypto.createHash('sha1');

          var newest = _.max(this.statCache, function(stat) {
            return moment(stat.mtime).valueOf();
          });

          shasum.update(moment(newest.mtime).valueOf().toString());
          var digest = shasum.digest('hex');
          deferred.resolve(digest);
        });

        return deferred.promise;
      }
      throw new Error("Source %s not is a directory", source);
    });
  }
}
