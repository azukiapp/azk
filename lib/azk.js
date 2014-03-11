var _      = require('underscore');
var cst    = require('../constants.js');
var i18n   = require('./i18n');
var path   = require('path');
var Q      = require('q');
var utils  = require('./utils');
var errors = require('./errors');
var fs     = require('q-io/fs');
var dns    = require('dns');

require('colors');
var initialized = false;

function initDirs() {
  return fs.exists(cst.DEFAULT_PID_PATH)
  .then(function(exist) {
    if (!exist) {
      console.log('Initializing folder for azk on %s', cst.DEFAULT_DATA_PATH);
      return Q.all([
        fs.makeTree(cst.DEFAULT_PID_PATH),
        fs.makeTree(cst.DEFAULT_LOG_PATH),
        fs.makeTree(cst.AZK_CLONE_PATH),
      ]);
    }
  });
}

function initConst() {
  return Q.nfcall(dns.lookup, cst.VM_NAME).then(function(result) {
    var ip = result[0];
    cst.SPFS_IP = utils.net_ip(ip);
    cst.VM_IP   = ip;
  });
}

function init() {
  return Q.async(function* () {
    yield initDirs();
    yield initConst();
  })();
}

var debug_cache = null;

module.exports = {
  t : new i18n({ locale: 'en-US' }).t,
  _ : _,
  Q : Q,
  init   : init,
  utils  : utils,
  debug  : function(type) {
    return function() {
      if (!debug_cache) {
        debug_cache = require("./debug");
      }
      debug_cache(type).apply(null, _.toArray(arguments));
    }
  },
  errors : errors,
  cst    : cst,
  pp: function() {
    console.log.apply(console, arguments);
  },

  fail: function(msg) {
    if (_.isObject(msg))
      msg = msg.stack;

    console.error("  %s %s", "azk:error".red, msg);
  },
  ok: function(msg) {
    console.log("%s: %s", "azk".blue, msg);
  },
}
