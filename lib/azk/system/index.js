"use strict";
var __moduleName = "src/system/index";
var $__9 = require('azk'),
    _ = $__9._,
    t = $__9.t,
    config = $__9.config,
    path = $__9.path,
    async = $__9.async,
    Q = $__9.Q;
var Image = require('azk/images').Image;
var net = require('azk/utils').net;
var XRegExp = require('xregexp').XRegExp;
var Run = require('azk/system/run').Run;
var Scale = require('azk/system/scale').Scale;
var regex_port = new XRegExp("(?<private>[0-9]{1,})(:(?<public>[0-9]{1,})){0,1}(/(?<protocol>tcp|udp)){0,1}", "x");
var System = function System(manifest, name, image) {
  var options = arguments[3] !== (void 0) ? arguments[3] : {};
  this.manifest = manifest;
  this.name = name;
  this.image = new Image(image);
  this.__options = options;
  this.options = _.merge({}, this.default_options, options);
  this.options = this._expand_template(this.options);
};
($traceurRuntime.createClass)(System, {
  get default_options() {
    return {
      shell: "/bin/sh",
      depends: [],
      envs: {},
      scalable: false
    };
  },
  runShell: function() {
    var $__10;
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$__2] = arguments[$__2];
    return ($__10 = Run).runShell.apply($__10, $traceurRuntime.spread([this], args));
  },
  runDaemon: function() {
    var $__10;
    for (var args = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      args[$__3] = arguments[$__3];
    return ($__10 = Run).runDaemon.apply($__10, $traceurRuntime.spread([this], args));
  },
  runProvision: function() {
    var $__10;
    for (var args = [],
        $__4 = 0; $__4 < arguments.length; $__4++)
      args[$__4] = arguments[$__4];
    return ($__10 = Run).runProvision.apply($__10, $traceurRuntime.spread([this], args));
  },
  stop: function() {
    var $__10;
    for (var args = [],
        $__5 = 0; $__5 < arguments.length; $__5++)
      args[$__5] = arguments[$__5];
    return ($__10 = Run).stop.apply($__10, $traceurRuntime.spread([this], args));
  },
  scale: function() {
    var $__10;
    for (var args = [],
        $__6 = 0; $__6 < arguments.length; $__6++)
      args[$__6] = arguments[$__6];
    return ($__10 = Scale).scale.apply($__10, $traceurRuntime.spread([this], args));
  },
  instances: function() {
    var $__10;
    for (var args = [],
        $__7 = 0; $__7 < arguments.length; $__7++)
      args[$__7] = arguments[$__7];
    return ($__10 = Scale).instances.apply($__10, $traceurRuntime.spread([this], args));
  },
  killAll: function() {
    var $__10;
    for (var args = [],
        $__8 = 0; $__8 < arguments.length; $__8++)
      args[$__8] = arguments[$__8];
    return ($__10 = Scale).killAll.apply($__10, $traceurRuntime.spread([this], args));
  },
  get provision_steps() {
    var steps = this.options.provision || [];
    if (!_.isArray(steps))
      steps = [];
    return steps;
  },
  get provisioned() {
    var key = this.name + ":provisioned";
    var date = this.manifest.getMeta(key);
    return date ? new Date(date) : null;
  },
  set provisioned(value) {
    var key = this.name + ":provisioned";
    return this.manifest.setMeta(key, value);
  },
  get raw_command() {
    return this.options.command;
  },
  get command() {
    var command = this.options.command;
    if (_.isEmpty(command)) {
      var msg = t("system.cmd_not_set", {system: this.name});
      command = [this.shell, "-c", ("echo \"" + msg + "\"; exit 1")];
    } else {
      command = [this.shell, "-c", command];
    }
    return command;
  },
  get workdir() {
    return this.options.workdir || "/";
  },
  get shell() {
    return this.options.shell;
  },
  get raw_mount_folders() {
    return this.options.mount_folders;
  },
  get scalable() {
    return this.options.scalable;
  },
  get namespace() {
    return this.manifest.namespace + '-sys.' + this.name;
  },
  get ports() {
    var ports = this.options.ports || {};
    if (_.isEmpty(ports.http) && this.options.http) {
      ports.http = "5000/tcp";
    }
    return ports;
  },
  get envs() {
    return this.options.envs;
  },
  get volumes() {
    var $__0 = this;
    var volumes = {};
    _.each(this.raw_mount_folders, (function(target, point) {
      point = path.resolve($__0.manifest.manifestPath, point);
      volumes[point] = target;
    }));
    return volumes;
  },
  get persistent_volumes() {
    var $__0 = this;
    var folders = {};
    var key = config('agent:requires_vm') ? 'agent:vm' : 'paths';
    var base = config(key + ':persistent_folders');
    return _.reduce(this.options.persistent_folders, (function(folders, folder) {
      var origin = path.join(base, $__0.manifest.namespace, $__0.name, folder);
      folders[origin] = folder;
      return folders;
    }), {});
  },
  get depends() {
    return this.options.depends;
  },
  get dependsInstances() {
    var $__0 = this;
    return _.map(this.depends, (function(depend) {
      return $__0.manifest.system(depend, true);
    }));
  },
  daemonOptions: function() {
    var options = arguments[0] !== (void 0) ? arguments[0] : {};
    if (options.image_data) {
      var config = options.image_data.Config;
      if (_.isEmpty(this.options.command) && _.isEmpty(options.command)) {
        options.command = config.Cmd;
      }
      if (_.isEmpty(this.options.workdir) && _.isEmpty(options.workdir)) {
        options.workdir = config.WorkingDir;
      }
      if (_.isEmpty(this.options.ports) && _.isEmpty(options.ports)) {
        options.ports = _.reduce(config.ExposedPorts, (function(ports, config, port) {
          ports[port] = port;
          return ports;
        }), {});
      }
    }
    options.ports = _.merge({}, this.ports, options.ports);
    return this._make_options(true, options);
  },
  shellOptions: function() {
    var options = arguments[0] !== (void 0) ? arguments[0] : {};
    options = _.defaults(options, {interactive: false});
    var opts = this._make_options(false, options);
    opts.annotations.azk.shell = options.interactive ? 'interactive' : 'script';
    _.merge(opts, {
      tty: options.interactive ? options.stdout.isTTY : false,
      stdout: options.stdout,
      stderr: options.stderr || options.stdout,
      stdin: options.interactive ? (options.stdin) : null
    });
    return opts;
  },
  _make_options: function(daemon) {
    var options = arguments[1] !== (void 0) ? arguments[1] : {};
    options = _.defaults(options, {
      workdir: this.options.workdir,
      volumes: {},
      local_volumes: {},
      envs: {},
      ports: {},
      sequencies: {}
    });
    var envs = _.merge({}, this.envs, options.envs);
    var ports = {};
    _.each(this._parse_ports(options.ports), (function(data, name) {
      if (!name.match(/\//)) {
        var env_key = (name.toUpperCase() + "_PORT");
        if (!envs[env_key])
          envs[env_key] = data.private;
      }
      ports[data.name] = [data.config];
    }));
    var type = daemon ? "daemon" : "shell";
    return {
      daemon: daemon,
      ports: ports,
      command: options.command || this.command,
      volumes: _.merge({}, this.volumes, options.volumes),
      local_volumes: _.merge({}, this.persistent_volumes, options.local_volumes),
      working_dir: options.workdir || this.workdir,
      env: envs,
      dns: net.nameServers(),
      annotations: {azk: {
          type: type,
          mid: this.manifest.namespace,
          sys: this.name,
          seq: (options.sequencies[type] || 0) + 1
        }}
    };
  },
  _parse_ports: function(ports) {
    return _.reduce(ports, (function(ports, port, name) {
      port = XRegExp.exec(port, regex_port);
      port.protocol = port.protocol || "tcp";
      var conf = {HostIp: config("agent:dns:ip")};
      if (port.public)
        conf.HostPort = port.public;
      ports[name] = {
        config: conf,
        name: port.private + "/" + port.protocol,
        private: port.private
      };
      return ports;
    }), {});
  },
  _expand_template: function(options) {
    var data = {
      system: {
        name: this.name,
        persistent_folders: "/data"
      },
      manifest: {
        dir: this.manifest.manifestDirName,
        project_name: this.manifest.manifestDirName
      },
      azk: {
        default_domain: config('agent:balancer:host'),
        balancer_port: config('agent:balancer:port'),
        balancer_ip: config('agent:balancer:ip')
      }
    };
    return JSON.parse(_.template(JSON.stringify(options), data));
  }
}, {});
module.exports = {
  get System() {
    return System;
  },
  __esModule: true
};
//# sourceMappingURL=index.js.map