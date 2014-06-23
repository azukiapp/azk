"use strict";
var __moduleName = "src/system/scale";
var $__0 = require('azk'),
    async = $__0.async,
    _ = $__0._;
var SystemDependError = require('azk/utils/errors').SystemDependError;
var docker = require('azk/docker').default;
var Scale = {
  scale: function(system, instances) {
    var options = arguments[2] !== (void 0) ? arguments[2] : {};
    options = _.defaults(options, {});
    return async(this, function() {
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return this.checkDepends(system);
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              $ctx.returnValue = true;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  checkDepends: function(system) {
    var depends = system.dependsInstances;
    return async(this, function() {
      var instances,
          depend,
          d;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              d = 0;
              $ctx.state = 11;
              break;
            case 11:
              $ctx.state = (d < depends.length) ? 5 : 9;
              break;
            case 8:
              d++;
              $ctx.state = 11;
              break;
            case 5:
              depend = depends[d];
              $ctx.state = 6;
              break;
            case 6:
              $ctx.state = 2;
              return this.instances(depend);
            case 2:
              instances = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              if (instances) {
                throw new SystemDependError(system.name, depend.name);
              }
              $ctx.state = 8;
              break;
            case 9:
              $ctx.returnValue = true;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  instances: function(system) {
    var include_dead = arguments[1] !== (void 0) ? arguments[1] : false;
    if (include_dead)
      include_dead = {all: true};
    return docker.listContainers(include_dead).then((function(containers) {
      return system.filter(containers);
    }));
  }
};
;
module.exports = {
  get Scale() {
    return Scale;
  },
  __esModule: true
};
//# sourceMappingURL=scale.js.map