"use strict";
var __moduleName = "src/agent/client";
var $__2 = require('azk'),
    _ = $__2._,
    Q = $__2.Q,
    defer = $__2.defer,
    log = $__2.log;
var $__2 = require('azk'),
    config = $__2.config,
    set_config = $__2.set_config;
var Agent = require('azk/agent').Agent;
var AgentNotRunning = require('azk/utils/errors').AgentNotRunning;
var request = require('request');
var HttpClient = {
  url: function(path) {
    return ("unix:\/\/" + config('paths:api_socket') + path);
  },
  request: function(method, path) {
    var opts = arguments[2] !== (void 0) ? arguments[2] : {};
    return Q.ninvoke(request, method, _.defaults(opts, {
      url: this.url(path),
      json: true
    }));
  },
  get: function() {
    var $__3;
    for (var args = [],
        $__1 = 0; $__1 < arguments.length; $__1++)
      args[$__1] = arguments[$__1];
    return ($__3 = this).request.apply($__3, $traceurRuntime.spread(['get'], args));
  }
};
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
  },
  configs: function() {
    return HttpClient.request('get', '/configs').spread((function(response, body) {
      return body;
    }));
  },
  require: function() {
    var $__0 = this;
    return this.status().then((function(status) {
      if (status.agent)
        return $__0.configs();
      throw new AgentNotRunning();
    })).then((function(configs) {
      _.each(configs, (function(value, key) {
        set_config(key, value);
      }));
    }));
  }
};
;
module.exports = {
  get Client() {
    return Client;
  },
  get HttpClient() {
    return HttpClient;
  },
  __esModule: true
};
//# sourceMappingURL=client.js.map