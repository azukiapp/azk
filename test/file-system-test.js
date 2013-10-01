var vows = require('vows');
var assert = require('assert');
var path = require('path');
var fs = require('../lib/file-system');
var fsMock = require('q-io/fs-mock');

var makeProjectDirMock = function(fileName, isNotDir) {
  var tree = {};
  if(fileName) {
    if(isNotDir) {
      tree[path.resolve('.', fileName)] = new Buffer('normal file', 'utf-8');
    } else {
      tree[path.resolve('.', fileName)] = {
        'Azkfile.json': new Buffer('json-content', 'utf-8')
      };
    }
  }
  var mock = fsMock(tree);
  return fs.usingFSLib(mock);
}

var makeCurrentPathMock = function(hasAzkfile, isDir) {
  var tree = {};
  if(hasAzkfile && !isDir) {
    //Azkfile exists
    tree[path.resolve('.')] = {
      'Azkfile.json': new Buffer('json-content', 'utf-8')
    };
  } else if(isDir) {
    //Azfile is dir
    tree[path.resolve('.')] = {
      'Azkfile.json': {
        'some-file': new Buffer('json-content', 'utf-8')
      }
    };
  } else {
    //current path empty
    tree[path.resolve('.')] = {}
  }
  var mock = fsMock(tree);
  return fs.usingFSLib(mock);
}

var callbackWithPromise = function(promise, context) {
  var self = context || this;
  promise.then(function(res) {
    self.callback(null, res);
  }, function(err) {
    self.callback(err, null);
  });
}

var pathEligibleToProject = function(fileName, _fs, context) {
  return callbackWithPromise(_fs.pathEligibleToProject(path.resolve('.', fileName)), context)
}

var hasAzkfileInCurrentPath = function(currentPath, _fs, context) {
  return callbackWithPromise(_fs.hasAzkfileInCurrentPath(currentPath), context)
}

vows.describe('file-system module').addBatch({
  '<pathEligibleToProject>': {

    'path already exists': {

      'and path is dir': {
        topic: function() {
          var _fs = makeProjectDirMock('project');
          pathEligibleToProject('project', _fs, this);
        },
        'must reject with: `exists`': function(err, exists) {
          assert.isNotNull(err);
          assert.isNull(exists);
          assert.equal(err, 'exists');
        }
      },

      'and path is not dir': {
        topic: function() {
          var _fs = makeProjectDirMock('project', true);
          pathEligibleToProject('project', _fs, this);
        },
        'must reject with: `not-dir`': function(err, exists) {
          assert.isNotNull(err);
          assert.isNull(exists);
          assert.equal(err, 'not-dir');
        }
      }

    },

    'path not exists': {
      topic: function() {
        var _fs = makeProjectDirMock();
        pathEligibleToProject('project', _fs, this);
      },
      'must resolve': function(err, exists) {
        assert.isNull(err);
        assert.strictEqual(exists, false);
      }
    }

  },

  '<hasAzkfileInCurrentPath>': {
    topic: function() {
      return path.resolve('.');
    },
    'yes': {
      topic: function(currentPath) {
        var _fs = makeCurrentPathMock(true);
        hasAzkfileInCurrentPath(currentPath, _fs, this);
      },
      'must reject with: exists': function(err, exists) {
        assert.isNotNull(err);
        assert.isNull(exists);
        assert.equal(err, 'exists');
      }
    },
    'no': {
      topic: function(currentPath) {
        var _fs = makeCurrentPathMock(false);
        hasAzkfileInCurrentPath(currentPath, _fs, this);
      },
      'must resolve': function(err, exists) {
        assert.isNull(err);
        assert.strictEqual(exists, false);
      }
    },
    'yes, but is directory': {
      topic: function(currentPath) {
        var _fs = makeCurrentPathMock(false, true);
        hasAzkfileInCurrentPath(currentPath, _fs, this);
      },
      'must reject with: is-dir': function(err, exists) {
        assert.isNotNull(err);
        assert.isNull(exists);
        assert.equal(err, 'is-dir');
      }
    }
  }
}).export(module);
