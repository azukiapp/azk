import { async, _ } from 'azk';
import { SystemDependError } from 'azk/utils/errors';
import docker from 'azk/docker';

var Scale = {

  scale(system, instances, options = {}) {
    // Default options
    options = _.defaults(options, {
    })

    return async(this, function* () {
      yield this.checkDepends(system);
      return true;
    });
  },

  checkDepends(system) {
    var depends = system.dependsInstances;
    return async(this, function* () {
      var instances, depend;
      for (var d = 0; d < depends.length; d++) {
        depend    = depends[d];
        instances = yield this.instances(depend);
        if (instances) {
          throw new SystemDependError(system.name, depend.name);
        }
      }

      return true;
    });
  },

  instances(system, include_dead = false) {
    if (include_dead) include_dead = { all: true };
    return docker.listContainers(include_dead).then((containers) => {
      return system.filter(containers);
    });
  },
}

export { Scale };
