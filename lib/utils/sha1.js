var fs      = require('fs');
var tar     = require('tar');
var fstream = require('fstream');
var azk     = require('../azk');
var crypto  = require('crypto');

var Q = azk.Q;
var fsstat = Q.nbind(fs.stat, fs);

module.exports = {
  calculate: function(source) {
    return fsstat(source).then(function(stat) {
      if (stat.isDirectory()) {
        var deferred = Q.defer();

        var reader = fstream.Reader({
          path: source, type: "Directory"
        });

        var shasum = crypto.createHash('sha1');
        var pack   = tar.Pack();

        pack.on('end', function() {
          deferred.resolve(shasum.digest('hex'));
        });

        pack.on('data', function(data) {
          shasum.update(data);
        });

        process.nextTick(function() {
          reader.pipe(pack);
        });

        return deferred.promise;
      }
      throw new Error("Source %s not is a directory", source);
    });
  }
}
