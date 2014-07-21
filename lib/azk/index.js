"use strict";
var __moduleName = "src/index";
require('traceur');
var version = require('package.json').version;
var $__2 = require('azk/config'),
    config = $__2.get,
    set_config = $__2.set;
var $__2 = require('azk/utils'),
    Q = $__2.Q,
    _ = $__2._,
    i18n = $__2.i18n,
    defer = $__2.defer,
    async = $__2.async;
Q.longStackSupport = true;
var Azk = function Azk() {};
($traceurRuntime.createClass)(Azk, {}, {
  get version() {
    return version;
  },
  pp: function() {
    var $__3;
    for (var args = [],
        $__1 = 0; $__1 < arguments.length; $__1++)
      args[$__1] = arguments[$__1];
    return ($__3 = console).log.apply($__3, $traceurRuntime.toObject(args));
  }
});
var t = new i18n({locale: config('locale')}).t;
var _log = null;
module.exports = {
  get default() {
    return Azk;
  },
  get pp() {
    return Azk.pp;
  },
  get Q() {
    return Q;
  },
  get _() {
    return _;
  },
  get t() {
    return t;
  },
  get config() {
    return config;
  },
  get set_config() {
    return set_config;
  },
  get defer() {
    return defer;
  },
  get async() {
    return async;
  },
  get path() {
    return require('path');
  },
  get fs() {
    return require('fs-extra');
  },
  get log() {
    if (!_log) {
      _log = require('azk/utils/log').log;
    }
    return _log;
  }
};
//# sourceMappingURL=index.js.map