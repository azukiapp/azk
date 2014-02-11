var _      = require('underscore');
var cst    = require('../constants.js');
var i18n   = require('i18next');
var path   = require('path');
var Q      = require('q');
var utils  = require('./utils');
var errors = require('./errors');
var fs     = require('q-io/fs');

var initialized = false;

function initDirs() {
  return fs.exists(cst.DEFAULT_PID_PATH)
  .then(function(exist) {
    if (!exist) {
      console.log('Initializing folder for azk on %s', cst.DEFAULT_FILE_PATH);
      return Q.all([
        fs.makeTree(cst.DEFAULT_PID_PATH),
        fs.makeTree(cst.DEFAULT_LOG_PATH),
        fs.makeTree(cst.AZK_CLONE_PATH),
      ]);
    }
  });
}

function init() {
  var deferred = Q.defer();
  var locales  = path.join(__dirname, "..", "locales", "__lng__", "__ns__.json");

  if (!initialized) {
    i18n.init(
      { lng: "en-US", resSetPath: locales },
      function() {
        initialized = true;
        initDirs().then(deferred.resolve);
      }
    )
  } else {
    deferred.resolve();
  }

  return deferred.promise;
}

module.exports = {
  t : i18n.t,
  _ : _,
  Q : Q,
  init   : init,
  utils  : utils,
  errors : errors,
  cst    : cst,
  pp: function() {
    console.log.apply(console, arguments);
  },
  fail: function(err) {
    console.log(err.stack);
  }
}
