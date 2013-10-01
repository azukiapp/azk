var Q = require('q');
var Qfs = require('q-io/fs');

var pathEligibleToProject = function(fs, filePath) {
  var deferred = Q.defer();
  fs.exists(filePath).then(function(exists) {
    if(exists) {
      fs.isDirectory(filePath).then(function(isDir){
        if(isDir) {
          deferred.reject('exists');
        } else {
          deferred.reject('not-dir');
        }
      });
    } else{
      deferred.resolve(exists);
    }
  });
  return deferred.promise;
}

var usingFSLib = function(FSLib) {
  return create(FSLib);
}

var create = function(fs) {
  return {
    pathEligibleToProject: pathEligibleToProject.bind(null, fs || Qfs),
    usingFSLib: usingFSLib,
    create: create
  }
}

module.exports = create()

