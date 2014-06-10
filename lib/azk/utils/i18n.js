"use strict";
var __moduleName = "src/utils/i18n";
var path = require('path');
var printf = require('printf');
function load(locale) {
  var file = path.join('locales', locale);
  return require(file);
}
var i18n = function i18n(opts) {
  var $__0 = this;
  if (typeof(opts.dict) == "object") {
    this.dict = opts.dict;
  } else if (opts.locale) {
    this.dict = load(opts.locale);
  }
  this.t = (function() {
    var $__3;
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$__2] = arguments[$__2];
    return ($__3 = $__0).translate.apply($__3, $traceurRuntime.toObject(args));
  });
};
($traceurRuntime.createClass)(i18n, {translate: function(key) {
    for (var args = [],
        $__2 = 1; $__2 < arguments.length; $__2++)
      args[$__2 - 1] = arguments[$__2];
    var keys = (typeof(key) == "string") ? key.split('.') : key;
    var buffer = this.dict || {};
    for (var i = 0; i < keys.length; i++) {
      buffer = buffer[keys[i]];
      if (!buffer)
        break;
    }
    if (buffer) {
      return typeof(buffer) == "string" ? printf.apply(null, $traceurRuntime.spread([buffer], args)) : buffer;
    } else {
      return (typeof(key) == "string" ? key : key.join("."));
    }
  }}, {});
module.exports = {
  get i18n() {
    return i18n;
  },
  __esModule: true
};
//# sourceMappingURL=i18n.js.map