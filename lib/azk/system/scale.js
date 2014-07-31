"use strict";
var __moduleName = "src/system/scale";
var $__0 = require('azk'),
    Q = $__0.Q,
    async = $__0.async,
    _ = $__0._;
var $__0 = require('azk/utils/errors'),
    SystemDependError = $__0.SystemDependError,
    SystemNotScalable = $__0.SystemNotScalable;
var docker = require('azk/docker').default;
var Scale = {
  start: function(system) {
    var options = arguments[1] !== (void 0) ? arguments[1] : {};
    return this.scale(system, system.default_instances, options);
  },
  scale: function(system, instances) {
    var options = arguments[2] !== (void 0) ? arguments[2] : {};
    if (!system.scalable && instances > 1) {
      return Q.reject(new SystemNotScalable(system));
    }
    options = _.defaults(options, {envs: {}});
    return async(this, function(notify) {
      var deps_envs,
          containers,
          from,
          icc,
          i;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return this.checkDependsAndReturnEnvs(system);
            case 2:
              deps_envs = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              options.envs = _.merge(deps_envs, options.envs || {});
              $ctx.state = 27;
              break;
            case 27:
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
              $ctx.state = 29;
              break;
            case 29:
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
              return system.runDaemon(options);
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
              return system.stop(containers, {rm: true});
            case 17:
              $ctx.maybeThrow();
              $ctx.state = 13;
              break;
            case 13:
              $ctx.returnValue = icc;
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
  checkDependsAndReturnEnvs: function(system) {
    var depends = system.dependsInstances;
    return async(this, function() {
      var instances,
          depend,
          envs,
          d,
          $__1,
          $__2,
          $__3,
          $__4,
          $__5;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              envs = {};
              $ctx.state = 23;
              break;
            case 23:
              d = 0;
              $ctx.state = 19;
              break;
            case 19:
              $ctx.state = (d < depends.length) ? 13 : 17;
              break;
            case 12:
              d++;
              $ctx.state = 19;
              break;
            case 13:
              depend = depends[d];
              $ctx.state = 14;
              break;
            case 14:
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
              $ctx.state = 16;
              break;
            case 16:
              $__1 = _.merge;
              $__2 = this.getEnvs;
              $__3 = $__2.call(this, depend, instances);
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = 6;
              return $__3;
            case 6:
              $__4 = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              $__5 = $__1.call(_, envs, $__4);
              envs = $__5;
              $ctx.state = 12;
              break;
            case 17:
              $ctx.returnValue = envs;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  getEnvs: function(system) {
    var instances = arguments[1] !== (void 0) ? arguments[1] : null;
    return async(this, function() {
      var ports,
          envs,
          data;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              ports = {}, envs = {};
              $ctx.state = 11;
              break;
            case 11:
              $ctx.state = (instances.length > 0) ? 1 : 6;
              break;
            case 1:
              $ctx.state = 2;
              return docker.getContainer(instances[0].Id).inspect();
            case 2:
              data = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              _.each(data.NetworkSettings.Access, (function(port) {
                ports[port.name] = port.port;
              }));
              envs = system.expandExportEnvs({
                envs: this._parseEnvs(data.Config.Env),
                net: {port: ports}
              });
              $ctx.state = 6;
              break;
            case 6:
              $ctx.returnValue = envs;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  _parseEnvs: function(collection) {
    return _.reduce(collection, (function(envs, env) {
      if (env.match(/\=/)) {
        env = env.split("=");
        envs[env[0]] = env[1];
      }
      return envs;
    }), {});
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