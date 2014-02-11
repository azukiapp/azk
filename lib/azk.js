var _      = require('underscore');
var cst    = require('../constants.js');
var i18n   = require('./i18n');
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
  return initDirs();
}

module.exports = {
  t : new i18n({ locale: 'en-US' }).t,
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
