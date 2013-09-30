var vows = require('vows');
var assert = require('assert');
var path = require("path");
var fs = require('../lib/file-system');
var fsMock = require("q-io/fs-mock");

var makeMock = function(fileName, isNotDir) {
  var tree = {};
  if(fileName) {
    if(isNotDir) {
      tree[path.resolve('.', fileName)] = new Buffer("normal file", "utf-8");
    } else {
      tree[path.resolve('.', fileName)] = {
        "Azkfile.json": new Buffer("json-content", "utf-8")
      };
    }
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

vows.describe('file-system module').addBatch({
  '`pathEligibleToProject`': {
    'path already exits': {
      'and path is dir': {
        topic: function() {
          var _fs = makeMock('project');
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
          var _fs = makeMock('project', true);
          pathEligibleToProject('project', _fs, this);
        },
        'must reject with: `not-dir`': function(err, exists) {
          assert.isNotNull(err);
          assert.isNull(exists);
          assert.equal(err, 'not-dir');
        }
      }
    },
    'path not exits': {
      topic: function() {
        var _fs = makeMock();
        pathEligibleToProject('project', _fs, this);
      },
      'must resolve': function(err, exists) {
        assert.isNull(err);
        assert.strictEqual(exists, exists);
      }
    }
  }
}).export(module);