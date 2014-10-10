"use strict";
var __moduleName = "src/index";
require('traceur');
var version = require('package.json').version;
var $__3 = require('azk/config'),
    config = $__3.get,
    set_config = $__3.set;
var $__3 = require('azk/utils'),
    Q = $__3.Q,
    _ = $__3._,
    i18n = $__3.i18n,
    defer = $__3.defer,
    async = $__3.async;
Q.longStackSupport = true;
var Azk = function Azk() {};
($traceurRuntime.createClass)(Azk, {}, {
  get version() {
    return version;
  },
  pp: function() {
    var $__4;
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$__2] = arguments[$__2];
    return ($__4 = console).log.apply($__4, $traceurRuntime.toObject(args));
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
  get os() {
    return require('os');
  },
  get path() {
    return require('path');
  },
  get fs() {
    return require('fs-extra');
  },
  get utils() {
    return require('azk/utils');
  },
  get dynamic() {
    var $__0 = this;
    return (function(obj, loads) {
      $__0._.each(loads, (function(func, getter) {
        obj.__defineGetter__(getter, func);
      }));
    });
  },
  get log() {
    if (!_log) {
      _log = require('azk/utils/log').log;
    }
    return _log;
  }
};
//# sourceMappingURL=index.js.map