import { Q, async, _ } from 'azk';
import { SystemDependError, SystemNotScalable } from 'azk/utils/errors';
import docker from 'azk/docker';

var Scale = {
  start(system, options = {}) {
    return this.scale(system, system.default_instances, options);
  },

  scale(system, instances, options = {}) {
    // Protect not scalable systems
    if (!system.scalable && instances > 1) {
      return Q.reject(new SystemNotScalable(system));
    }

    // Default options
    options = _.defaults(options, {
      envs: {},
    });

    return async(this, function* (notify) {
      var deps_envs = yield this.checkDependsAndReturnEnvs(system);
      options.envs = _.merge(deps_envs, options.envs || {});

      var containers = yield this.instances(system);

      var from = containers.length;
      var icc  = instances - from;

      if (icc != 0)
        notify({ type: "scale", from, to: from + icc, system: this.name });

      if (icc > 0) {
        for(var i = 0; i < icc; i++) {
          yield system.runDaemon(options);
        }
      } else if (icc < 0) {
        containers = containers.reverse().slice(0, Math.abs(icc));
        yield system.stop(containers, { rm: true });
      }

      return icc;
    });
  },

  killAll(system, options = {}) {
    options = _.defaults(options, {
      kill: true,
    });

    return this.instances(system).then((instances) => {
      return system.stop(instances, options.kill);
    });
  },

  checkDependsAndReturnEnvs(system) {
    var depends = system.dependsInstances;
    return async(this, function* () {
      var instances, depend, envs = {};

      for (var d = 0; d < depends.length; d++) {
        depend    = depends[d];
        instances = yield this.instances(depend);
        if (_.isEmpty(instances)) {
          throw new SystemDependError(system.name, depend.name);
        }
        envs = _.merge(envs, yield this.getEnvs(depend, instances));
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
    // Default options
    options = _.defaults(options, {
      include_dead: false,
      include_exec: false,
    })

    // Include dead containers
    var query_options = {};
    if (options.include_dead) query_options.all = true ;

    return docker.azkListContainers(query_options).then((containers) => {
      return _.filter(containers, (container) => {
        var azk = container.Annotations.azk;
        return azk.mid == system.manifest.namespace && azk.sys == system.name;
      });
    });
  },
}

export { Scale };
