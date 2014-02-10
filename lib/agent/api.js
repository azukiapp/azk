'use strict';

/**
 * Module dependencies
 */

var EventEmitter2 = require('eventemitter2').EventEmitter2;
var azk   = require('../azk');
var p9fs  = require('node-p9fs');
var debug = require('debug')('azk:agent');
var path  = require('path');

var cst = azk.cst;
var Q   = azk.Q;

/**
 * Expose Api
 */

var Api = module.exports = {
  bus : new EventEmitter2({
    wildcard: true,
    delimiter: ':',
    newListener: false,
    maxListeners: 20
  })
};

var p9fs_child = null;

// TODO: Check for docker ou vm
Api.init = function() {
  return azk.init().then(function() {
    var done  = Q.defer();

    p9fs_child = p9fs(cst.SPFS_PORT, cst.SPFS_IP);
    p9fs_child.on('start', function() {
      debug(
        'p9fs server started in %s:%s',
        cst.SPFS_IP, cst.SPFS_PORT
      )
      done.resolve();
    });

    return done.promise;
  });
}

Api.stop = function() {
  var done = Q.defer();

  p9fs_child.on('stop', function() {
    done.resolve();
  });

  p9fs_child.stop();

  return done.promise;
}

Api.ex_ping = function(cb) {
  cb(null, 'any');
}

Api.ex_resolve = function(target, cb) {
  cb(null, path.join(cst.AZK_AGENT_MOUNT, target));
}
