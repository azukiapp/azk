"use strict";
var $__2;
var __moduleName = "src/manifest/system";
var $__5 = require('azk'),
    _ = $__5._,
    path = $__5.path,
    fs = $__5.fs,
    config = $__5.config,
    async = $__5.async,
    defer = $__5.defer;
var Image = require('azk/images').Image;
var Balancer = require('azk/agent/balancer').Balancer;
var XRegExp = require('xregexp').XRegExp;
var docker = require('azk/docker').default;
var $__5 = require('azk/utils/errors'),
    SystemDependError = $__5.SystemDependError,
    ImageNotAvailable = $__5.ImageNotAvailable,
    RunCommandError = $__5.RunCommandError;
var MemoryStream = require('memorystream');
var printf = require('printf');
var regex_port = new XRegExp("(?<private>[0-9]{1,})(:(?<public>[0-9]{1,})){0,1}(/(?<protocol>tcp|udp)){0,1}", "x");
var System = function System(manifest, name, image) {
  var options = arguments[3] !== (void 0) ? arguments[3] : {};
  this.manifest = manifest;
  this.name = name;
  this.image = new Image(image);
  this.options = _.merge({}, this.default_options, options);
  this.options = this._expand_template(options);
};
var $System = System;
($traceurRuntime.createClass)(System, ($__2 = {}, Object.defineProperty($__2, "default_options", {
  get: function() {
    return {
      depens: [],
      balancer: null,
      persistent_dir: false,
      envs: {}
    };
  },
  configurable: true,
  enumerable: true
}), Object.defineProperty($__2, "namespace", {
  get: function() {
    return this.manifest.namespace + '.' + this.name;
  },
  configurable: true,
  enumerable: true
}), Object.defineProperty($__2, "hosts", {
  get: function() {
    var balancer = this.options.balancer || {};
    return (balancer.alias || []).concat(balancer.hostname);
  },
  configurable: true,
  enumerable: true
}), Object.defineProperty($__2, "balanceable", {
  get: function() {
    return this.hosts.length > 0;
  },
  configurable: true,
  enumerable: true
}), Object.defineProperty($__2, "depends", {
  get: function() {
    return this.options.depends || [];
  },
  configurable: true,
  enumerable: true
}), Object.defineProperty($__2, "persistent_dir", {
  get: function() {
    var key = config('agent:requires_vm') ? 'agent:vm' : 'paths';
    var base = config(key + ':persistent_dirs');
    return path.join(base, this.manifest.namespace, this.name);
  },
  configurable: true,
  enumerable: true
}), Object.defineProperty($__2, "volumes", {
  get: function() {
    var $__0 = this;
    var volumes = {};
    _.each(this.options.sync_files, (function(target, point) {
      point = path.resolve($__0.manifest.manifestPath, point);
      volumes[point] = target;
    }));
    return volumes;
  },
  configurable: true,
  enumerable: true
}), Object.defineProperty($__2, "instances", {
  value: function() {
    var include_dead = arguments[0] !== (void 0) ? arguments[0] : false;
    var $__0 = this;
    if (include_dead)
      include_dead = {all: true};
    return docker.listContainers(include_dead).then((function(containers) {
      var regex = RegExp($__0.namespace);
      return _.filter(containers, function(container) {
        return container.Names[0].match(regex);
      });
    }));
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "killAll", {
  value: function() {
    var $__0 = this;
    return this.instances().then((function(instances) {
      return $__0._kill_or_stop(instances, true);
    }));
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "scale", {
  value: function(instances, stdout) {
    var pull = arguments[2] !== (void 0) ? arguments[2] : false;
    return async(this, function(notify) {
      var depends_instances,
          containers,
          from,
          to;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return this._dependencies_instances();
            case 2:
              depends_instances = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (this._check_dependencies(depends_instances)) ? 5 : 16;
              break;
            case 5:
              $ctx.state = 6;
              return this.instances();
            case 6:
              containers = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 10;
              return this._check_image(pull);
            case 10:
              $ctx.maybeThrow();
              $ctx.state = 12;
              break;
            case 12:
              from = containers.length;
              to = instances - from;
              if (to != 0)
                notify({
                  type: "scale",
                  from: from,
                  to: from + to,
                  system: this.name
                });
              $ctx.state = 26;
              break;
            case 26:
              $ctx.state = (to > 0) ? 13 : 23;
              break;
            case 13:
              $ctx.state = 14;
              return this.run(true, to, depends_instances);
            case 14:
              $ctx.maybeThrow();
              $ctx.state = 16;
              break;
            case 23:
              $ctx.state = (to < 0) ? 21 : 16;
              break;
            case 21:
              containers = containers.reverse().slice(0, Math.abs(to));
              $ctx.state = 22;
              break;
            case 22:
              $ctx.state = 18;
              return this._kill_or_stop(containers);
            case 18:
              $ctx.maybeThrow();
              $ctx.state = 16;
              break;
            case 16:
              $ctx.returnValue = true;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "make_options", {
  value: function(daemon) {
    var opts = arguments[1] !== (void 0) ? arguments[1] : {};
    var name = this.namespace + (daemon ? '.daemon' : '.exec');
    var run_options = {
      daemon: daemon,
      ports: {},
      volumes: _.merge({}, this.volumes, opts.volumes || {}),
      local_volumes: {},
      working_dir: opts.workdir || this.options.workdir,
      env: this.options.env || {}
    };
    if (!daemon) {
      name += opts.interactive ? '.interactive' : '.raw';
      _.merge(run_options, {
        tty: opts.interactive ? opts.stdout.isTTY : false,
        stdout: opts.stdout,
        stderr: opts.stderr || opts.stdout,
        stdin: opts.interactive ? (opts.stdin) : null
      });
    }
    if (this.options.persistent_dir) {
      run_options.local_volumes[this.persistent_dir] = '/azk/_data_';
      run_options.env.AZK_PERSISTENT_DIR = '/azk/_data_';
    }
    run_options.ns = name;
    return run_options;
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "exec", {
  value: function(command, opts) {
    var run_options = this.make_options(false, opts);
    var image = this.image.name;
    run_options.env = this._more_envs(run_options.env, {});
    return async(this, function() {
      var container,
          data;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return this._check_image(opts.pull);
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = 6;
              return docker.run(image, command, run_options);
            case 6:
              container = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 10;
              return container.inspect();
            case 10:
              data = $ctx.sent;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.returnValue = data.State.ExitCode;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "provision_steps", {
  get: function() {
    var steps = this.options.provision || [];
    if (!_.isArray(steps))
      steps = [];
    return steps;
  },
  configurable: true,
  enumerable: true
}), Object.defineProperty($__2, "provisioned", {
  get: function() {
    var key = this.name + ":provisioned";
    var date = this.manifest.getMeta(key);
    return date ? new Date(date) : null;
  },
  configurable: true,
  enumerable: true,
  set: function(value) {
    var key = this.name + ":provisioned";
    return this.manifest.setMeta(key, value);
  }
}), Object.defineProperty($__2, "provision", {
  value: function() {
    var opts = arguments[0] !== (void 0) ? arguments[0] : {};
    var $__0 = this;
    return defer((function(resolve, reject, notify) {
      var steps = $__0.provision_steps;
      if (steps.length == 0)
        return null;
      if ((!opts.force_provision) && $__0.provisioned)
        return null;
      var cmd = ["/bin/sh", "-c", "( " + steps.join('; ') + " )"];
      opts = _.clone(opts);
      opts.stdout = new MemoryStream();
      var output = "";
      opts.stdout.on('data', (function(data) {
        output += data.toString();
      }));
      notify({
        type: "provision",
        system: $__0.name
      });
      return $__0.exec(cmd, opts).then((function(code) {
        if (code != 0) {
          throw new RunCommandError(cmd.join(' '), output);
        }
        $__0.provisioned = new Date();
      }));
    }));
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "ports", {
  get: function() {
    var ports = this.options.ports || {};
    if (_.keys(ports).length == 0) {
      ports.__default__ = "5000/tcp";
    }
    return _.reduce(ports, (function(ports, port, name) {
      port = XRegExp.exec(port, regex_port);
      port.protocol = port.protocol || "tcp";
      var config = {HostIp: "0.0.0.0"};
      if (port.public)
        config.HostPort = port.public;
      ports[name] = {
        config: config,
        name: port.private + "/" + port.protocol,
        private: port.private
      };
      return ports;
    }), {});
  },
  configurable: true,
  enumerable: true
}), Object.defineProperty($__2, "run", {
  value: function(daemon, instances, depends_instances) {
    var self = this;
    var options = this.make_options(true);
    options.env = this._more_envs(options.env, {}, depends_instances);
    var cmd = ['/bin/sh', '-c', this.options.command];
    _.each(this.ports, (function(data, name) {
      var env_key = "PORT";
      if (name != "__default__")
        env_key = (name.toUpperCase() + "_" + env_key);
      options.env[env_key] = data.private;
      options.ports[data.name] = [data.config];
    }));
    return async(this, function(notify) {
      var i,
          container,
          $__6,
          $__7,
          $__8,
          $__9,
          $__10;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 21;
              break;
            case 21:
              $ctx.state = (i < instances) ? 17 : -2;
              break;
            case 16:
              i++;
              $ctx.state = 21;
              break;
            case 17:
              notify({
                type: 'run_service',
                system: this.name
              });
              $ctx.state = 18;
              break;
            case 18:
              $ctx.state = 2;
              return docker.run(this.image.name, cmd, options);
            case 2:
              container = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $__6 = this._balancer_add;
              $__7 = container.inspect;
              $__8 = $__7.call(container);
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = 6;
              return $__8;
            case 6:
              $__9 = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              $__10 = $__6.call(this, $__9);
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 14;
              return $__10;
            case 14:
              $ctx.maybeThrow();
              $ctx.state = 16;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "_check_image", {
  value: function() {
    var pull = arguments[0] !== (void 0) ? arguments[0] : false;
    var $__0 = this;
    if (pull) {
      var promise = this.image.pull();
    } else {
      var promise = this.image.check().then((function(image) {
        if (image == null) {
          throw new ImageNotAvailable($__0.name, $__0.image.name);
        }
      }));
    }
    return promise.progress((function(event) {
      event.system = $__0;
      return event;
    }));
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "_check_dependencies", {
  value: function(instances) {
    var not_valid = _.find(this.depends, (function(depend_name) {
      return instances[depend_name].length <= 0;
    }));
    if (not_valid) {
      throw new SystemDependError(this.name, not_valid, 'run');
    }
    return true;
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "_dependencies_instances", {
  value: function() {
    var self = this;
    var instances = {};
    return async(function() {
      var $__3,
          $__4,
          depend_name,
          depend;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__3 = self.depends[Symbol.iterator]();
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (!($__4 = $__3.next()).done) ? 10 : 12;
              break;
            case 10:
              depend_name = $__4.value;
              $ctx.state = 11;
              break;
            case 11:
              depend = self.manifest.systems[depend_name];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (depend instanceof $System) ? 1 : 5;
              break;
            case 1:
              $ctx.state = 2;
              return depend.instances();
            case 2:
              instances[depend_name] = $ctx.sent;
              $ctx.state = 4;
              break;
            case 5:
              throw new SystemDependError(self.name, depend_name, 'define');
              $ctx.state = 4;
              break;
            case 12:
              $ctx.returnValue = instances;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "_kill_or_stop", {
  value: function(instances) {
    var kill = arguments[1] !== (void 0) ? arguments[1] : false;
    var self = this;
    var port = self.options.port || 3000;
    return async(function(notify) {
      var container;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              container = null;
              $ctx.state = 22;
              break;
            case 22:
              $ctx.state = (container = instances.pop()) ? 1 : -2;
              break;
            case 1:
              $ctx.state = 2;
              return self._remove_proxy(port, container);
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              container = docker.getContainer(container.Id);
              $ctx.state = 19;
              break;
            case 19:
              $ctx.state = (kill) ? 9 : 15;
              break;
            case 9:
              notify({
                type: 'kill_service',
                system: self.name
              });
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = 6;
              return container.kill();
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 22;
              break;
            case 15:
              notify({
                type: 'stop_service',
                system: self.name
              });
              $ctx.state = 16;
              break;
            case 16:
              $ctx.state = 12;
              return container.stop();
            case 12:
              $ctx.maybeThrow();
              $ctx.state = 22;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "_balancer_add", {
  value: function(container) {
    if (this.balanceable) {
      var ports = this.ports;
      var port = ports.http || ports.__default__;
      var backend = printf("http://%s:%s", config('agent:vm:ip'), container.NetworkSettings.Ports[port.name][0].HostPort);
      return Balancer.addBackend(this.hosts, backend);
    }
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "_remove_proxy", {
  value: function(port, container) {
    if (!_.isEmpty(this.hosts)) {
      var backend = printf("http://%s:%s", config('agent:vm:ip'), container.Ports[0].PublicPort);
      return Balancer.removeBackend(this.hosts, backend);
    }
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "_expand_template", {
  value: function(options) {
    return JSON.parse(_.template(JSON.stringify(options), {
      system: {
        name: this.name,
        persistent_dir: "/azk/_data_"
      },
      manifest: {
        dir: this.manifest.manifestDirName,
        project_name: this.manifest.manifestDirName
      },
      azk: {
        default_domain: config('docker:default_domain'),
        balancer_port: config('agent:balancer:port')
      }
    }));
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "add_env", {
  value: function(key, value) {
    var $__2;
    this.__extra_envs = _.merge(this.__extra_envs || {}, ($__2 = {}, Object.defineProperty($__2, key, {
      value: value,
      configurable: true,
      enumerable: true,
      writable: true
    }), $__2));
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "_more_envs", {
  value: function(envs, options) {
    var depends_instances = arguments[2] !== (void 0) ? arguments[2] : [];
    return _.merge({}, this._dependencies_envs(depends_instances), this._envs_from_file(), envs, this.__extra_envs || {});
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "_dependencies_envs", {
  value: function(depends_instances) {
    var envs = {};
    _.each(depends_instances, (function(instances, depend) {
      _.each(instances, (function(instance) {
        envs[depend.toUpperCase() + '_HOST'] = config('agent:vm:ip');
        envs[depend.toUpperCase() + '_PORT'] = instance.Ports[0].PublicPort;
      }));
    }));
    return envs;
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__2, "_envs_from_file", {
  value: function() {
    var envs = {};
    var file = path.join(this.manifest.manifestPath, '.env');
    if (fs.existsSync(file)) {
      var content = fs.readFileSync(file).toString();
      _.each(content.split('\n'), (function(entry) {
        entry = entry.split('=');
        envs[entry[0]] = entry[1];
      }));
    }
    return envs;
  },
  configurable: true,
  enumerable: true,
  writable: true
}), $__2), {});
module.exports = {
  get System() {
    return System;
  },
  __esModule: true
};
//# sourceMappingURL=system.js.map