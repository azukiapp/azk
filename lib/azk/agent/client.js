"use strict";
var __moduleName = "src/agent/client";
var $__0 = require('azk'),
    Q = $__0.Q,
    config = $__0.config,
    defer = $__0.defer,
    log = $__0.log;
var Agent = require('azk/agent').Agent;
var Client = {
  status: function(opts) {
    var status = {
      agent: false,
      docker: false,
      balancer: false
    };
    return defer((function(resolve, _reject, notify) {
      if (Agent.agentPid().running) {
        notify({
          type: "status",
          status: "running"
        });
        status.agent = true;
      } else {
        notify({
          type: "status",
          status: "not_running"
        });
      }
      resolve(status);
    }));
  },
  start: function(opts) {
    return Agent.start(opts).then((function() {
      return 0;
    }));
  },
  stop: function(opts) {
    return Agent.stop();
  }
};
;
module.exports = {
  get Client() {
    return Client;
  },
  __esModule: true
};
//# sourceMappingURL=client.js.map