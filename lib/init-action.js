var path = require('path');
var Q = require('q');
var fileSystem = require('./file-system');

var detectWorkDir = function(fs, project, isForce) {
  var deferred = Q.defer();
  if(project) {
    var filePath = path.resolve('.', project);
    fs.pathEligibleToProject(filePath).then(function() {
      // todo: fs.createProjectDirectory(filePath)
      deferred.resolve(filePath);
    }, function(cause) {
      if(isForce) {
        deferred.resolve(filePath);
      } else {
        switch (cause) {
          case 'exists':
          deferred.reject('Directory exists, use --force to overwrite data');
          break;
          case 'not-dir':
          deferred.reject('This path exists and is not directory');
          break;
          default:
          deferred.reject('Can not create directory');
          break;
        }
      }
    });
  } else {
    // todo: implements without project
  }

  return deferred.promise;
}

var detectProjectType = function() {
}

var startUserSurvey = function() {
}

var waitUserConfirmSurvey = function() {
}

var createAzkfile = function() {
}

var start = function(args) {
  /* todo: could work like this
  Q.then(detectWorkDir)
  .then(detectProjectType)
  .then(startUserSurvey)
  .then(waitUserConfirmSurvey)
  .then(createAzkfile)
  .then(function() {
    console.log('Azkfile created');
  }, function() {
    console.log('Azkfile not created');
  });
  */
}

var usingFileSystem = function(fs) {
  return create(fs);
  return this;
}

var create = function(fs) {
  return {
    usingFileSystem: usingFileSystem,
    createCommand: create.bind(null, fileSystem),
    detectWorkDir: detectWorkDir.bind(null, fs || fileSystem),
    detectProjectType: detectProjectType,
    waitUserConfirmSurvey: waitUserConfirmSurvey,
    createAzkfile: createAzkfile,
    start: start
  }
}

module.exports = create();
