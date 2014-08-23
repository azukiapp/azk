import { Q, async, _ } from 'azk';
import { SystemDependError, SystemNotScalable } from 'azk/utils/errors';
import { Balancer } from 'azk/system/balancer';
import docker from 'azk/docker';

var Scale = {
  start(system, options = {}) {
    return this.scale(system, system.default_instances, options);
  },

  scale(system, instances = {}, options = {}) {
    // Default instances
    if (_.isObject(instances)) {
      options   = _.merge(instances, options);
      instances = system.default_instances;
    }

    // Protect not scalable systems
    if (!system.scalable && instances > 1) {
      return Q.reject(new SystemNotScalable(system));
    }

    // Default options
    options = _.defaults(options, {
      envs: {},
      dependencies: true,
    });

    return async(this, function* (notify) {
      var deps_envs = yield this.checkDependsAndReturnEnvs(system, options);
      options.envs  = _.merge(deps_envs, options.envs || {});

      var containers = yield this.instances(system);
      var from = containers.length;
      var icc  = instances - from;

      if (icc != 0)
        notify({ type: "scale", from, to: from + icc, system: system.name });

      if (icc > 0) {
        for(var i = 0; i < icc; i++) {
          yield system.runDaemon(_.clone(options));
          options.provision_force = false;
        }
      } else if (icc < 0) {
        containers = containers.reverse().slice(0, Math.abs(icc));
        yield system.stop(containers, options);
      }

      return icc;
    });
  },

  killAll(system, options = {}) {
    return async(this, function* () {
      options = _.defaults(options, {
        kill: true,
      });

      // Clear balancer
      yield Balancer.clear(system);

      var instances = yield this.instances(system);
      return system.stop(instances, options.kill);
    });
  },

  _dependencies_options(options) {
    return {
      dependencies: options.dependencies,
      pull: options.pull,
    };
  },

  checkDependsAndReturnEnvs(system, options, required = true) {
    var depends = system.dependsInstances;
    return async(this, function* () {
      var instances, depend, envs = {};

      for (var d = 0; d < depends.length; d++) {
        depend    = depends[d];
        instances = yield this.instances(depend);
        if (_.isEmpty(instances) && required) {
          // Run dependencies
          if (options.dependencies) {
            yield depend.start(this._dependencies_options(options));
            instances = yield this.instances(depend);
          } else {
            throw new SystemDependError(system.name, depend.name);
          }
        }

        if (!_.isEmpty(instances)) {
          envs = _.merge(envs, yield this.getEnvs(depend, instances));
        }
      }

      return envs;
    });
  },

  getEnvs(system, instances = null) {
    return async(this, function* () {
      var ports = {}, envs = {};
      if (instances.length > 0) {
        var data = yield docker.getContainer(instances[0].Id).inspect();
        _.each(data.NetworkSettings.Access, (port) => {
          ports[port.name] = port.port;
        });
        envs = system.expandExportEnvs({
          envs: this._parseEnvs(data.Config.Env),
          net: { port: ports }
        });
      }
      return envs;
    });
  },

  _parseEnvs(collection) {
    return _.reduce(collection, (envs, env) => {
      if (env.match(/\=/)) {
        env = env.split("=");
        envs[env[0]] = env[1];
      }
      return envs;
    }, {});
  },

  instances(system, options = {}) {
    return system.instances(_.defaults(options, {
      type: "daemon",
    }));
  },
}

export { Scale };
