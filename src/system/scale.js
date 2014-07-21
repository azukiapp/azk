import { async, _ } from 'azk';
import { SystemDependError } from 'azk/utils/errors';
import docker from 'azk/docker';

var Scale = {
  scale(system, instances, options = {}) {
    // Default options
    options = _.defaults(options, {
    });

    return async(this, function* (notify) {
      yield this.checkDepends(system);
      var containers = yield this.instances(system);

      var from = containers.length;
      var icc  = instances - from;

      if (icc != 0)
        notify({ type: "scale", from, to: from + icc, system: this.name });

      if (icc > 0) {
        for(var i = 0; i < icc; i++) {
          yield system.runDaemon();
        }
      } else if (icc < 0) {
        containers = containers.reverse().slice(0, Math.abs(icc));
        yield this._kill_or_stop(containers);
      }

      return true;
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

  checkDepends(system) {
    var depends = system.dependsInstances;
    return async(this, function* () {
      var instances, depend;
      for (var d = 0; d < depends.length; d++) {
        depend    = depends[d];
        instances = yield this.instances(depend);
        if (_.isEmpty(instances)) {
          throw new SystemDependError(system.name, depend.name);
        }
      }
      return true;
    });
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
