import { _, path, config, async } from 'azk';
import { Image } from 'azk/images';
import { Balancer } from 'azk/agent/balancer';
import { SystemDependError } from 'azk/utils/errors';
import docker from 'azk/docker';

var printf = require('printf');

export class System {
  constructor(manifest, name, image, options = {}) {
    this.manifest = manifest;
    this.name     = name;
    this.image    = new Image(image);
    this.options  = this._expand_template(options);
  }

  get namespace() {
    return this.manifest.namespace + '.' + this.name;
  }

  get hosts() {
    var balancer = this.options.balancer || {};
    return [...balancer.alias || [], balancer.hostname || [] ];
  }

  get depends() {
    return this.options.depends || [];
  }

  instances() {
    return docker.listContainers().then((containers) => {
      var regex = RegExp(this.namespace);
      return _.filter(containers, function(container) {
        return container.Names[0].match(regex)
      });
    });
  }

  killAll() {
    return this.instances().then((instances) => {
      return this._kill_or_stop(instances, true);
    });
  }

  scale(instances, stdout) {
    var self = this;
    return async(function* () {
      var depends_instances = yield self._dependencies_instances();
      if (self._check_dependencies(depends_instances)) {
        var containers = yield self.instances();
        yield self.image.pull(stdout);

        var from = containers.length;
        var to   = instances - from;

        if (to > 0) {
          yield self.run(true, to, depends_instances);
        } else if (to < 0) {
          containers = containers.reverse().slice(0, Math.abs(to));
          yield self._kill_or_stop(containers);
        }
      }
    });
  }

  run(daemon, instances, depends_instances) {
    var self    = this;
    var name    = self.namespace + '.daemon';
    var cmd     = ['/bin/sh', '-c', self.options.command];
    var options = {
      daemon: true,
      working_dir: self.options.workdir,
      env: self.options.env || {},
      ports: {},
      volumes: {},
      ns: name,
    }

    // dependencies instances map
    options.env = _.merge(self._dependencies_map(depends_instances), options.env);

    // Volumes
    _.each(self.options.sync_files, (target, point) => {
      point = path.resolve(self.manifest.manifestPath, point);
      options.volumes[point] = target;
    });

    // Port map
    var port = self.options.port || 3000;
    var port_name = port + "/tcp";
    options.ports[port_name] = [{ HostIp: "0.0.0.0" }];
    options.env.PORT = port;

    return async(function* () {
      for(var i = 0; i < instances; i++) {
        var container = yield docker.run(self.image.name, cmd, options);
        yield self._balancer_add(port_name, yield container.inspect());
      }
    });
  }

  _check_dependencies(instances) {
    var not_valid = _.find(this.depends, (depend_name) => {
      return instances[depend_name].length <= 0
    });
    if (not_valid) {
      throw new SystemDependError(this.name, not_valid, 'run');
    }
    return true;
  }

  _dependencies_instances() {
    var self = this;
    var instances = {};
    return async(function* () {
      for (var depend_name of self.depends) {
        var depend = self.manifest.systems[depend_name];
        if (depend instanceof System) {
          instances[depend_name] = yield depend.instances();
        } else {
          throw new SystemDependError(self.name, depend_name, 'define');
        }
      }
      return instances;
    });
  }

  // TODO: fix api x database
  _dependencies_map(depends_instances) {
    var envs = {};

    _.each(depends_instances, (instances, depend) => {
      _.each(instances, (instance) => {
        envs[depend.toUpperCase() + '_HOST'] = config('agent:vm:ip');
        envs[depend.toUpperCase() + '_PORT'] = instance.Ports[0].PublicPort;
      })
    });

    return envs;
  }

  _kill_or_stop(instances, kill = false) {
    var self = this;
    var port = self.options.port || 3000;
    return async(function* () {
      var container = null;
      while (container = instances.pop()) {
        yield self._remove_proxy(port, container);
        container = docker.getContainer(container.Id);
        if (kill) {
          yield container.kill();
        } else {
          yield container.stop();
        }
      }
    })
  }

  _balancer_add(port_name, container) {
    if (!_.isEmpty(this.hosts)) {
      var backend = printf(
            "http://%s:%s", config('agent:vm:ip'),
            container.NetworkSettings.Ports[port_name][0].HostPort
          );
      return Balancer.addBackend(this.hosts, backend);
    }
  }

  _remove_proxy(port, container) {
    if (!_.isEmpty(this.hosts)) {
      var backend = printf(
            "http://%s:%s", config('agent:vm:ip'),
            container.Ports[0].PublicPort
          );
      return Balancer.removeBackend(this.hosts, backend);
    }
  }

  _expand_template(options) {
    return JSON.parse(_.template(JSON.stringify(options), {
      system: this,
      azk: {
        default_domain: config('docker:default_domain'),
      }
    }));
  }
}
