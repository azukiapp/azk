var path = require('path');
var Q = require('q');
var Qfs = require('q-io/fs');

var AZKFILE_NAME = 'Azkfile.json'

var pathEligibleToProject = function(fs, filePath) {
  var deferred = Q.defer();
  fs.exists(filePath).then(function(exists) {
    if(exists) {
      fs.isDirectory(filePath).then(function(isDir) {
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

var hasAzkfileInCurrentPath = function(fs, currentPath) {
  var deferred = Q.defer();
  if(currentPath && currentPath.join) {
    var filePath = currentPath.join(AZKFILE_NAME);
  } else {
    var filePath = path.resolve('.', AZKFILE_NAME);
  }
  fs.exists(filePath).then(function(exists) {
    if(exists) {
      fs.isDirectory(filePath).then(function(isDir) {
        if(isDir) {
          deferred.reject('is-dir');
        } else {
          deferred.reject('exists');
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
    hasAzkfileInCurrentPath: hasAzkfileInCurrentPath.bind(null, fs || Qfs),
    usingFSLib: usingFSLib,
    create: create
  }
}

module.exports = create()

