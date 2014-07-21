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
    return async(this, function(notify) {
      var containers,
          from,
          icc,
          i;
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
              $ctx.state = 6;
              return this.instances(system);
            case 6:
              containers = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              from = containers.length;
              icc = instances - from;
              if (icc != 0)
                notify({
                  type: "scale",
                  from: from,
                  to: from + icc,
                  system: this.name
                });
              $ctx.state = 27;
              break;
            case 27:
              $ctx.state = (icc > 0) ? 14 : 22;
              break;
            case 14:
              i = 0;
              $ctx.state = 15;
              break;
            case 15:
              $ctx.state = (i < icc) ? 9 : 13;
              break;
            case 12:
              i++;
              $ctx.state = 15;
              break;
            case 9:
              $ctx.state = 10;
              return system.runDaemon();
            case 10:
              $ctx.maybeThrow();
              $ctx.state = 12;
              break;
            case 22:
              $ctx.state = (icc < 0) ? 20 : 13;
              break;
            case 20:
              containers = containers.reverse().slice(0, Math.abs(icc));
              $ctx.state = 21;
              break;
            case 21:
              $ctx.state = 17;
              return this._kill_or_stop(containers);
            case 17:
              $ctx.maybeThrow();
              $ctx.state = 13;
              break;
            case 13:
              $ctx.returnValue = true;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  killAll: function(system) {
    var options = arguments[1] !== (void 0) ? arguments[1] : {};
    options = _.defaults(options, {kill: true});
    return this.instances(system).then((function(instances) {
      return system.stop(instances, options.kill);
    }));
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
              if (_.isEmpty(instances)) {
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
    var options = arguments[1] !== (void 0) ? arguments[1] : {};
    options = _.defaults(options, {
      include_dead: false,
      include_exec: false
    });
    var query_options = {};
    if (options.include_dead)
      query_options.all = true;
    return docker.azkListContainers(query_options).then((function(containers) {
      return _.filter(containers, (function(container) {
        var azk = container.Annotations.azk;
        return azk.mid == system.manifest.namespace && azk.sys == system.name;
      }));
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