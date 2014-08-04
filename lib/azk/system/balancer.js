"use strict";
var __moduleName = "src/system/balancer";
var $__0 = require('azk'),
    async = $__0.async,
    config = $__0.config;
var Balancer = require('azk/agent/balancer').Balancer;
var SystemBalancer = {
  clear: function(system) {
    return async(this, function() {
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = (system.balanceable) ? 1 : 2;
              break;
            case 1:
              $ctx.returnValue = Balancer.removeAll(system.hostname);
              $ctx.state = -2;
              break;
            case 2:
              $ctx.returnValue = false;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  add: function(system, container) {
    return this._addOrRemove(system, container, 'addBackend');
  },
  remove: function(system, container) {
    return this._addOrRemove(system, container, 'removeBackend');
  },
  list: function(system) {
    if (system.balanceable) {
      return Balancer.getBackends(system.hostname);
    } else {
      return Q([]);
    }
  },
  _addOrRemove: function(system, container, method) {
    return async(this, function() {
      var data,
          backend;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = (system.balanceable) ? 1 : 6;
              break;
            case 1:
              $ctx.state = 2;
              return container.inspect();
            case 2:
              data = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (data.State.Running) ? 8 : 6;
              break;
            case 8:
              backend = this._formatBackend(system, data);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (backend) ? 5 : 6;
              break;
            case 5:
              $ctx.returnValue = Balancer[method](system.hosts, backend);
              $ctx.state = -2;
              break;
            case 6:
              $ctx.returnValue = null;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  _formatBackend: function(system, container) {
    var port = container.NetworkSettings.Access[system.http_port] || {};
    if (port.port) {
      return ("http://" + config('agent:vm:ip') + ":" + port.port);
    }
  }
};
;
;
module.exports = {
  get SystemBalancer() {
    return SystemBalancer;
  },
  get Balancer() {
    return SystemBalancer;
  },
  __esModule: true
};
//# sourceMappingURL=balancer.js.map