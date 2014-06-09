"use strict";
var __moduleName = "src/agent/tools";
var $__2 = require('azk'),
    async = $__2.async,
    defer = $__2.defer,
    log = $__2.log;
var Tools = {
  change_status: function(key, notify, status, data) {
    var keys = ["commands", key, "status", status];
    (status != "error") ? log.info_t(keys, data) : null;
    notify({
      type: "status",
      context: key,
      status: status,
      data: data
    });
  },
  defer_status: function(key, func) {
    var $__0 = this;
    return defer((function(resolve, reject, notify) {
      return func(resolve, reject, (function(status, data) {
        $__0.change_status(key, notify, status, data);
      }));
    }));
  },
  async_status: function(key) {
    for (var args = [],
        $__1 = 1; $__1 < arguments.length; $__1++)
      args[$__1 - 1] = arguments[$__1];
    var $__0 = this;
    return defer((function(_resolve, _reject, notify) {
      args = $traceurRuntime.spread(args, [(function(status, data) {
        $__0.change_status(key, notify, status, data);
      })]);
      return async.apply(null, $traceurRuntime.toObject(args));
    }));
  }
};
;
module.exports = {
  get Tools() {
    return Tools;
  },
  __esModule: true
};
//# sourceMappingURL=tools.js.map