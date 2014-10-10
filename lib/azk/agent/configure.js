"use strict";
var __moduleName = "src/agent/configure";
var $__1 = require('azk'),
    os = $__1.os,
    Q = $__1.Q,
    async = $__1.async;
var $__1 = require('azk'),
    config = $__1.config,
    set_config = $__1.set_config;
var UIProxy = require('azk/cli/ui').UIProxy;
var $__1 = require('azk/utils/errors'),
    OSNotSupported = $__1.OSNotSupported,
    DependencieError = $__1.DependencieError;
var which = require('which');
var Configure = function Configure(user_interface) {
  $traceurRuntime.superCall(this, $Configure.prototype, "constructor", [user_interface]);
};
var $Configure = Configure;
($traceurRuntime.createClass)(Configure, {
  run: function() {
    var method = this[os.platform()];
    if (method) {
      return method.apply(this);
    } else {
      throw new OSNotSupported(os.platform());
    }
  },
  darwin: function() {
    return Q.all([this._which('VBoxManage'), this._which('unfsd')]);
  },
  _which: function(command) {
    return Q.nfcall(which, command).fail((function() {
      throw new DependencieError(command);
    }));
  }
}, {}, UIProxy);
module.exports = {
  get Configure() {
    return Configure;
  },
  __esModule: true
};
//# sourceMappingURL=configure.js.map