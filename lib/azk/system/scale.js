"use strict";
var __moduleName = "src/system/scale";
var $__0 = require('azk'),
    Q = $__0.Q,
    async = $__0.async,
    _ = $__0._;
var $__0 = require('azk/utils/errors'),
    SystemDependError = $__0.SystemDependError,
    SystemNotScalable = $__0.SystemNotScalable;
var Balancer = require('azk/system/balancer').Balancer;
var docker = require('azk/docker').default;
var Scale = {
  start: function(system) {
    var options = arguments[1] !== (void 0) ? arguments[1] : {};
    return this.scale(system, system.default_instances, options);
  },
  scale: function(system) {
    var instances = arguments[1] !== (void 0) ? arguments[1] : {};
    var options = arguments[2] !== (void 0) ? arguments[2] : {};
    if (_.isObject(instances)) {
      options = _.merge(instances, options);
      instances = system.default_instances;
    }
    if (!system.scalable && instances > 1) {
      return Q.reject(new SystemNotScalable(system));
    }
    options = _.defaults(options, {
      envs: {},
      dependencies: true
    });
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
              return this.checkDependsAndReturnEnvs(system, options);
            case 2:
              deps_envs = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              options.envs = _.merge(deps_envs, options.envs || {});
              $ctx.state = 29;
              break;
            case 29:
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
                  system: system.name
                });
              $ctx.state = 31;
              break;
            case 31:
              $ctx.state = (icc > 0) ? 16 : 24;
              break;
            case 16:
              i = 0;
              $ctx.state = 17;
              break;
            case 17:
              $ctx.state = (i < icc) ? 9 : 15;
              break;
            case 14:
              i++;
              $ctx.state = 17;
              break;
            case 9:
              $ctx.state = 10;
              return system.runDaemon(_.clone(options));
            case 10:
              $ctx.maybeThrow();
              $ctx.state = 12;
              break;
            case 12:
              options.provision_force = false;
              $ctx.state = 14;
              break;
            case 24:
              $ctx.state = (icc < 0) ? 22 : 15;
              break;
            case 22:
              containers = containers.reverse().slice(0, Math.abs(icc));
              $ctx.state = 23;
              break;
            case 23:
              $ctx.state = 19;
              return system.stop(containers, options);
            case 19:
              $ctx.maybeThrow();
              $ctx.state = 15;
              break;
            case 15:
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
    return async(this, function() {
      var instances;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              options = _.defaults(options, {kill: true});
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 2;
              return Balancer.clear(system);
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = 6;
              return this.instances(system);
            case 6:
              instances = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              $ctx.returnValue = system.stop(instances, options.kill);
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  _dependencies_options: function(options) {
    return {
      dependencies: options.dependencies,
      pull: options.pull
    };
  },
  checkDependsAndReturnEnvs: function(system, options) {
    var required = arguments[2] !== (void 0) ? arguments[2] : true;
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
              $ctx.state = 34;
              break;
            case 34:
              d = 0;
              $ctx.state = 30;
              break;
            case 30:
              $ctx.state = (d < depends.length) ? 26 : 28;
              break;
            case 24:
              d++;
              $ctx.state = 30;
              break;
            case 26:
              depend = depends[d];
              $ctx.state = 27;
              break;
            case 27:
              $ctx.state = 2;
              return this.instances(depend);
            case 2:
              instances = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (_.isEmpty(instances) && required) ? 15 : 12;
              break;
            case 15:
              $ctx.state = (options.dependencies) ? 5 : 13;
              break;
            case 5:
              $ctx.state = 6;
              return depend.start(this._dependencies_options(options));
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 10;
              return this.instances(depend);
            case 10:
              instances = $ctx.sent;
              $ctx.state = 12;
              break;
            case 13:
              throw new SystemDependError(system.name, depend.name);
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (!_.isEmpty(instances)) ? 21 : 24;
              break;
            case 21:
              $__1 = _.merge;
              $__2 = this.getEnvs;
              $__3 = $__2.call(this, depend, instances);
              $ctx.state = 22;
              break;
            case 22:
              $ctx.state = 18;
              return $__3;
            case 18:
              $__4 = $ctx.sent;
              $ctx.state = 20;
              break;
            case 20:
              $__5 = $__1.call(_, envs, $__4);
              envs = $__5;
              $ctx.state = 24;
              break;
            case 28:
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
    return system.instances(_.defaults(options, {type: "daemon"}));
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