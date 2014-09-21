"use strict";
var __moduleName = "src/utils/docker";
var $__1 = require('azk'),
    _ = $__1._,
    path = $__1.path,
    config = $__1.config;
var Utils = require('azk').utils;
var docker = function docker() {};
($traceurRuntime.createClass)(docker, {}, {resolvePath: function(target) {
    var point = arguments[1] !== (void 0) ? arguments[1] : config('agent:vm:mount_point');
    target = Utils.resolve(target);
    if (config('agent:requires_vm')) {
      target = path.join(point, target);
    }
    return target;
  }});
var $__default = docker;
module.exports = {
  get default() {
    return $__default;
  },
  __esModule: true
};
//# sourceMappingURL=docker.js.map