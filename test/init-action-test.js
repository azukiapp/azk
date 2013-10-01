var vows = require('vows');
var assert = require('assert');
var Q = require('q');
var path = require('path');
var action = require('../lib/init-action');

var fileSystemMock = function(rejectReason, resolvePath) {
  return {
    pathEligibleToProject: function(filePath) {
      var deferred = Q.defer();
      process.nextTick(function() {
        if(rejectReason && !resolvePath) {
          deferred.reject(rejectReason);
        } else {
          deferred.resolve(resolvePath);
        }
      });
      return deferred.promise;
    }
  }
}

var makeMock = function(rejectReason, resolvePath) {
  var mock = fileSystemMock(rejectReason, resolvePath);
  return action.usingFileSystem(mock);
}

var callbackWithPromise = function(promise, context) {
  var self = context || this;
  promise.then(function(res) {
    self.callback(null, res);
  }, function(err) {
    self.callback(err, null);
  });
}

var detectWorkDirWith = function(project, force, _action, context) {
  return callbackWithPromise(_action.detectWorkDir(project, force), context);
}

var thisPath = path.resolve('.');

vows.describe('InitAction').addBatch({
  '<detecWorkDir>': {

    'receiving project:': {

      'work dir already exists': {
        topic: function() {
          return makeMock('exists');
        },
        'without --force': {
          topic: function(_action) {
            detectWorkDirWith('project', false, _action, this);
          },
          'reject with warm msg: use --force': function(err, workDir) {
            assert.isNotNull(err);
            assert.isNull(workDir);
            assert.equal(err, 'Directory exists, use --force to overwrite data');
          }
        },
        'with --force': {
          topic: function(_action) {
            detectWorkDirWith('project', true, _action, this);
          },
          'resolve with workDir path': function(err, workDir) {
            assert.isNull(err);
            assert.equal(workDir, path.resolve(thisPath, 'project'));
          }
        }
      },

      'work dir not exists': {
        topic: function() {
          return makeMock(false, path.resolve(thisPath, 'project'));
        },
        'without --force': {
          topic: function(_action) {
            detectWorkDirWith('project', false, _action, this);
          },
          'resolve with workDir path': function(err, workDir) {
            assert.isNull(err);
            assert.equal(workDir, path.resolve(thisPath, 'project'));
          }
        },
        'with --force': {
          topic: function(_action) {
            detectWorkDirWith('project', true, _action, this);
          },
          'resolve with workDir path': function(err, workDir) {
            assert.isNull(err);
            assert.equal(workDir, path.resolve(thisPath, 'project'));
          }
        }
      }

    }

  }
}).export(module);
