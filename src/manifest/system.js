import { _, path, fs, config, async, defer } from 'azk';
import { Image } from 'azk/images';
import { Balancer } from 'azk/agent/balancer';
import docker from 'azk/docker';
import {
  SystemDependError,
  ImageNotAvailable,
  RunCommandError,
} from 'azk/utils/errors';

var MemoryStream  = require('memorystream');
var printf = require('printf');

export class System {
  constructor(manifest, name, image, options = {}) {
    this.manifest = manifest;
    this.name     = name;
    this.image    = new Image(image);
    this.options  = _.merge({}, this.default_options, options);
    this.options  = this._expand_template(options);
  }

  get default_options() {
    return {
      depens: [],
      balancer: null,
      persistent_dir: false,
      envs: {},
    }
  }

  get namespace() {
    return this.manifest.namespace + '.' + this.name;
  }

  get hosts() {
    var balancer = this.options.balancer || {};
    return (balancer.alias || []).concat(balancer.hostname);
  }

  get depends() {
    return this.options.depends || [];
  }

  get persistent_dir() {
    var key  = config('agent:requires_vm') ? 'agent:vm' : 'paths';
    var base = config(key + ':persistent_dirs');
    return path.join(base, this.manifest.namespace, this.name);
  }

  get volumes() {
    var volumes = { };

    // Volumes
    _.each(this.options.sync_files, (target, point) => {
      point = path.resolve(this.manifest.manifestPath, point);
      volumes[point] = target;
    });

    return volumes;
  }

  instances(include_dead = false) {
    if (include_dead) include_dead = { all: true };
    return docker.listContainers(include_dead).then((containers) => {
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

  scale(instances, stdout, pull = false) {
    var self = this;
    return async(function* (notify) {
      var depends_instances = yield self._dependencies_instances();
      if (self._check_dependencies(depends_instances)) {
        var containers = yield self.instances();
        if (pull)
          yield self.image.pull(pull);
        else
          yield self._check_image();

        var from = containers.length;
        var to   = instances - from;

        if (to != 0)
          notify({ type: "scale", from, to: from + to, system: self.name });

        if (to > 0) {
          yield self.run(true, to, depends_instances);
        } else if (to < 0) {
          containers = containers.reverse().slice(0, Math.abs(to));
          yield self._kill_or_stop(containers);
        }
      }
      return true;
    });
  }

  make_options(daemon, opts = {}) {
    var name = this.namespace + (daemon ? '.daemon' : '.exec');
    var run_options = {
      daemon: daemon,
      ports: {},
      volumes: this.volumes,
      local_volumes: {},
      working_dir: this.options.workdir,
      env: this.options.env || {},
    }

    // Daemon or exec mode?
    if (!daemon) {
      name += opts.interactive ? '.interactive' : '.raw';
      _.merge(run_options, {
        tty: opts.interactive ? opts.stdout.isTTY : false,
        stdout: opts.stdout,
        stderr: opts.stderr || opts.stdout,
        stdin: opts.interactive ? (opts.stdin) : null,
      });
    }

    // Persistent dir
    if (this.options.persistent_dir) {
      run_options.local_volumes[this.persistent_dir] = '/azk/_data_';
      run_options.env.AZK_PERSISTENT_DIR = '/azk/_data_';
    }

    run_options.ns = name;
    return run_options;
  }

  exec(command, opts) {
    var self  = this;
    var run_options = this.make_options(false, opts);
    var image = this.image.name;

    run_options.env = this._more_envs(run_options.env, {});

    return async(function* () {
      if (opts.pull)
        yield self.image.pull(opts.pull);
      else
        yield self._check_image();
      var container = yield docker.run(image, command, run_options);
      var data      = yield container.inspect();
      return data.State.ExitCode
    });
  }

  get provision_steps() {
    var steps = this.options.provision || [];
    if (!_.isArray(steps)) steps = [];
    return steps;
  }

  get provisioned() {
    var key  = this.name + ":provisioned";
    var date = this.manifest.getMeta(key);
    return date ? new Date(date) : null;
  }

  set provisioned(value) {
    var key  = this.name + ":provisioned";
    return this.manifest.setMeta(key, value);
  }

  provision(opts = {}) {
    return defer((resolve, reject, notify) => {
      var steps = this.provision_steps;

      if (steps.length == 0) return null;
      if ((!opts.force_provision) && this.provisioned) return null;

      // provision command (require /bin/sh)
      var cmd  = ["/bin/sh", "-c", "( " + steps.join('; ') + " )"];

      // Erros
      opts = _.clone(opts);
      opts.stdout = new MemoryStream();
      var output  = "";
      opts.stdout.on('data', (data) => {
        output += data.toString();
      });

      notify({ type: "provision", system: this.name });
      return this.exec(cmd, opts).then((code) => {
        if (code != 0) {
          throw new RunCommandError(cmd.join(' '), output);
        }
        this.provisioned = new Date();
      });
    });
  }

  run(daemon, instances, depends_instances) {
    var self    = this;
    var options = this.make_options(true);

    // Add more envs
    options.env = this._more_envs(options.env, {}, depends_instances);

    // Command
    var cmd = ['/bin/sh', '-c', self.options.command];

    // Port map
    var port = self.options.port || 3000;
    var port_name = port + "/tcp";
    options.ports[port_name] = [{ HostIp: "0.0.0.0" }];
    options.env.PORT = port;

    return async(function* (notify) {
      for(var i = 0; i < instances; i++) {
        notify({ type: 'run_service', system: self.name });
        var container = yield docker.run(self.image.name, cmd, options);
        yield self._balancer_add(port_name, yield container.inspect());
      }
    });
  }

  _check_image() {
    return this.image.check().then((image) => {
      if (image == null) {
        throw new ImageNotAvailable(this.name, this.image.name);
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

  _kill_or_stop(instances, kill = false) {
    var self = this;
    var port = self.options.port || 3000;
    return async(function* (notify) {
      var container = null;
      while (container = instances.pop()) {
        yield self._remove_proxy(port, container);
        container = docker.getContainer(container.Id);
        if (kill) {
          notify({ type: 'kill_service', system: self.name });
          yield container.kill();
        } else {
          notify({ type: 'stop_service', system: self.name });
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
      system: {
        name: this.name,
        persistent_dir: "/azk/_data_",
      },
      manifest: {
        dir: this.manifest.manifestDirName,
        project_name: this.manifest.manifestDirName,
      },
      azk: {
        default_domain: config('docker:default_domain'),
      }
    }));
  }

  add_env(key, value) {
    this.__extra_envs = _.merge(this.__extra_envs || {}, { [key]: value });
  }

  _more_envs(envs, options, depends_instances = []) {
    return _.merge({},
      this._dependencies_envs(depends_instances),
      this._envs_from_file(),
      envs,
      this.__extra_envs || {}
    )
  }

  // TODO: fix api x database
  _dependencies_envs(depends_instances) {
    var envs = {};

    _.each(depends_instances, (instances, depend) => {
      _.each(instances, (instance) => {
        envs[depend.toUpperCase() + '_HOST'] = config('agent:vm:ip');
        envs[depend.toUpperCase() + '_PORT'] = instance.Ports[0].PublicPort;
      })
    });

    return envs;
  }

  _envs_from_file() {
    var envs = {};
    var file = path.join(this.manifest.manifestPath, '.env');

    if (fs.existsSync(file)) {
      var content = fs.readFileSync(file).toString();
      _.each(content.split('\n'), (entry) => {
        entry = entry.split('=');
        envs[entry[0]] = entry[1];
      });
    }

    return envs;
  }
}
