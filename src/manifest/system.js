import { _, path, fs, config, async, defer } from 'azk';
import { Image } from 'azk/images';
import { Balancer } from 'azk/agent/balancer';
import { XRegExp } from 'xregexp';
import docker from 'azk/docker';
import {
  SystemDependError,
  ImageNotAvailable,
  RunCommandError,
} from 'azk/utils/errors';

var MemoryStream = require('memorystream');
var printf       = require('printf');
var regex_port   = new XRegExp(
  "(?<private>[0-9]{1,})(:(?<public>[0-9]{1,})){0,1}(/(?<protocol>tcp|udp)){0,1}", "x"
)

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

  get balanceable() {
    return this.hosts.length > 0;
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
    return async(this, function* (notify) {
      var depends_instances = yield this._dependencies_instances();
      if (this._check_dependencies(depends_instances)) {
        var containers = yield this.instances();
        yield this._check_image(pull);

        var from = containers.length;
        var to   = instances - from;

        if (to != 0)
          notify({ type: "scale", from, to: from + to, system: this.name });

        if (to > 0) {
          yield this.run(true, to, depends_instances);
        } else if (to < 0) {
          containers = containers.reverse().slice(0, Math.abs(to));
          yield this._kill_or_stop(containers);
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
      volumes: _.merge({}, this.volumes, opts.volumes || {}),
      local_volumes: {},
      working_dir: opts.workdir || this.options.workdir,
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
    var run_options = this.make_options(false, opts);
    var image = this.image.name;

    run_options.env = this._more_envs(run_options.env, {});

    return async(this, function* () {
      yield this._check_image(opts.pull);
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

  get ports() {
    var ports = this.options.ports || {};
    if (_.keys(ports).length == 0) {
      ports.__default__ = "5000/tcp"
    }

    return _.reduce(ports, (ports, port, name) => {
      port = XRegExp.exec(port, regex_port);
      port.protocol = port.protocol || "tcp";

      var config = { HostIp: "0.0.0.0" };
      if (port.public)
        config.HostPort = port.public;

      ports[name] = {
        config : config,
        name   : port.private + "/" + port.protocol,
        private: port.private
      };
      return ports;
    }, {})
  }

  run(daemon, instances, depends_instances) {
    var self    = this;
    var options = this.make_options(true);

    // Add more envs
    options.env = this._more_envs(options.env, {}, depends_instances);

    // Command
    var cmd = ['/bin/sh', '-c', this.options.command];

    // Port map
    _.each(this.ports, (data, name) => {
      var env_key = "PORT";
      if (name != "__default__")
        env_key = `${name.toUpperCase()}_${env_key}`;

      options.env[env_key] = data.private;
      options.ports[data.name] = [data.config]
    });

    return async(this, function* (notify) {
      for(var i = 0; i < instances; i++) {
        notify({ type: 'run_service', system: this.name });
        var container = yield docker.run(this.image.name, cmd, options);
        yield this._balancer_add(yield container.inspect());
      }
    });
  }

  _check_image(pull = false) {
    if (pull) {
      var promise = this.image.pull();
    } else {
      var promise = this.image.check().then((image) => {
        if (image == null) {
          throw new ImageNotAvailable(this.name, this.image.name);
        }
      });
    }

    return promise.progress((event) => {
      event.system = this;
      return event;
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

  _balancer_add(container) {
    if (this.balanceable) {
      var ports = this.ports;
      var port  = ports.http || ports.__default__;

      var backend = printf(
            "http://%s:%s", config('agent:vm:ip'),
            container.NetworkSettings.Ports[port.name][0].HostPort
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
        balancer_port: config('agent:balancer:port'),
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
  // TODO: fix multi port
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
