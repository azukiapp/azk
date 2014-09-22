"use strict";
var __moduleName = "src/system/index";
var $__13 = require('azk'),
    _ = $__13._,
    t = $__13.t,
    config = $__13.config,
    path = $__13.path,
    async = $__13.async,
    Q = $__13.Q,
    fs = $__13.fs,
    utils = $__13.utils;
var Image = require('azk/images').Image;
var net = require('azk/utils').net;
var XRegExp = require('xregexp').XRegExp;
var Run = require('azk/system/run').Run;
var Scale = require('azk/system/scale').Scale;
var Balancer = require('azk/system/balancer').Balancer;
var regex_port = new XRegExp("(?<private>[0-9]{1,})(:(?<public>[0-9]{1,})){0,1}(/(?<protocol>tcp|udp)){0,1}", "x");
var System = function System(manifest, name, image) {
  var options = arguments[3] !== (void 0) ? arguments[3] : {};
  this.manifest = manifest;
  this.name = name;
  this.image = new Image(image);
  this.__options = {};
  this.options = _.merge({}, this.default_options, options);
  this.options = this._expand_template(this.options);
};
($traceurRuntime.createClass)(System, {
  set options(values) {
    this.__options = values;
  },
  get options() {
    return this.__options;
  },
  get default_options() {
    return {
      shell: "/bin/sh",
      depends: [],
      envs: {},
      scalable: false
    };
  },
  runShell: function() {
    var $__14;
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$__2] = arguments[$__2];
    return ($__14 = Run).runShell.apply($__14, $traceurRuntime.spread([this], args));
  },
  runDaemon: function() {
    var $__14;
    for (var args = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      args[$__3] = arguments[$__3];
    return ($__14 = Run).runDaemon.apply($__14, $traceurRuntime.spread([this], args));
  },
  runProvision: function() {
    var $__14;
    for (var args = [],
        $__4 = 0; $__4 < arguments.length; $__4++)
      args[$__4] = arguments[$__4];
    return ($__14 = Run).runProvision.apply($__14, $traceurRuntime.spread([this], args));
  },
  stop: function() {
    var $__14;
    for (var args = [],
        $__5 = 0; $__5 < arguments.length; $__5++)
      args[$__5] = arguments[$__5];
    return ($__14 = Run).stop.apply($__14, $traceurRuntime.spread([this], args));
  },
  instances: function() {
    var $__14;
    for (var args = [],
        $__6 = 0; $__6 < arguments.length; $__6++)
      args[$__6] = arguments[$__6];
    return ($__14 = Run).instances.apply($__14, $traceurRuntime.spread([this], args));
  },
  throwRunError: function() {
    var $__14;
    for (var args = [],
        $__7 = 0; $__7 < arguments.length; $__7++)
      args[$__7] = arguments[$__7];
    return ($__14 = Run).throwRunError.apply($__14, $traceurRuntime.spread([this], args));
  },
  start: function() {
    var $__14;
    for (var args = [],
        $__8 = 0; $__8 < arguments.length; $__8++)
      args[$__8] = arguments[$__8];
    return ($__14 = Scale).start.apply($__14, $traceurRuntime.spread([this], args));
  },
  scale: function() {
    var $__14;
    for (var args = [],
        $__9 = 0; $__9 < arguments.length; $__9++)
      args[$__9] = arguments[$__9];
    return ($__14 = Scale).scale.apply($__14, $traceurRuntime.spread([this], args));
  },
  killAll: function() {
    var $__14;
    for (var args = [],
        $__10 = 0; $__10 < arguments.length; $__10++)
      args[$__10] = arguments[$__10];
    return ($__14 = Scale).killAll.apply($__14, $traceurRuntime.spread([this], args));
  },
  checkDependsAndReturnEnvs: function() {
    var $__14;
    for (var args = [],
        $__11 = 0; $__11 < arguments.length; $__11++)
      args[$__11] = arguments[$__11];
    return ($__14 = Scale).checkDependsAndReturnEnvs.apply($__14, $traceurRuntime.spread([this], args));
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
  get namespace() {
    return this.manifest.namespace + '-sys.' + this.name;
  },
  get default_instances() {
    return (this.options.scalable || {}).default || 1;
  },
  get scalable() {
    return this.options.scalable ? true : false;
  },
  get wait_scale() {
    var wait = this.options.wait;
    return _.isEmpty(wait) && wait != false ? true : wait;
  },
  get hostname() {
    return (this.options.http || {}).hostname || config('agent:balancer:host');
  },
  get balanceable() {
    var ports = this.ports;
    return ports.http && (this.options.http || {}).hostname;
  },
  get url() {
    var host = this.hostname;
    var port = parseInt(config('agent:balancer:port'));
    return ("http://" + host + (port == 80 ? '' : ':' + port));
  },
  get hosts() {
    return [this.hostname];
  },
  backends: function() {
    return Balancer.list(this);
  },
  get http_port() {
    var ports = this._parse_ports(this.ports);
    return ports.http.private;
  },
  portName: function(sought) {
    var ports = this._parse_ports(this.ports);
    var name = sought;
    _.each(ports, (function(port, port_name) {
      if (parseInt(sought) == parseInt(port.private)) {
        name = port_name;
      }
    }));
    return name;
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
  expandExportEnvs: function(data) {
    var $__0 = this;
    var ports,
        envs = {};
    data = _.defaults(data, {
      envs: {},
      net: {}
    });
    data.net = _.defaults(data.net, {
      host: this.hostname,
      port: {}
    });
    _.each(data.net.port, (function(port_public, port_private) {
      var key_port = (($__0.name + "_" + port_private + "_PORT")).toUpperCase();
      var key_host = (($__0.name + "_" + port_private + "_HOST")).toUpperCase();
      envs[key_port] = port_public;
      envs[key_host] = data.net.host;
    }));
    ports = this._parse_ports(this.ports);
    _.each(ports, (function(config, name) {
      var port = data.net.port[config.private];
      var key_port = (($__0.name + "_" + name + "_PORT")).toUpperCase();
      var key_host = (($__0.name + "_" + name + "_HOST")).toUpperCase();
      data.net.port[name] = port;
      if (port && _.isEmpty(data.envs[key_port])) {
        envs[key_port] = port;
      }
      if (_.isEmpty(data.envs[key_host])) {
        envs[key_host] = data.net.host;
      }
    }));
    var key = this.env_key('URL');
    if (ports.http && _.isEmpty(envs[key])) {
      envs[key] = ("http://" + data.net.host);
    }
    envs = _.reduce(this.options.export_envs || {}, (function(envs, value, key) {
      envs[key.toUpperCase()] = value;
      return envs;
    }), envs);
    return JSON.parse(utils.template(JSON.stringify(envs), data));
  },
  env_key: function() {
    for (var args = [],
        $__12 = 0; $__12 < arguments.length; $__12++)
      args[$__12] = arguments[$__12];
    return ((this.name + "_" + $traceurRuntime.spread(args).join("_"))).toUpperCase();
  },
  get mounts() {
    return this._mounts_to_volumes(this.options.mounts || {});
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
    options.ports = _.merge({}, this.ports, options.ports);
    if (options.image_data) {
      var config = options.image_data.Config;
      if (_.isEmpty(this.options.command) && _.isEmpty(options.command)) {
        options.command = config.Cmd;
      }
      if (_.isEmpty(this.options.workdir) && _.isEmpty(options.workdir)) {
        options.workdir = config.WorkingDir;
      }
      var ports = _.reduce(options.ports, (function(ports, value, key) {
        if (value == null) {
          value = (key + "/tcp");
        }
        ports[key] = value;
        return ports;
      }), {});
      _.each(config.ExposedPorts, (function(_config, port) {
        var have = _.find(ports, (function(value, key) {
          return value.match(new RegExp((parseInt(port) + "\/(tcp|udp)$")));
        }));
        if (!have) {
          options.ports[port] = port;
        }
      }));
    }
    options.ports = _.reduce(options.ports, (function(ports, value, key) {
      if (value != null) {
        ports[key] = value;
      }
      return ports;
    }), {});
    return this._make_options(true, options);
  },
  shellOptions: function() {
    var options = arguments[0] !== (void 0) ? arguments[0] : {};
    options = _.defaults(options, {interactive: false});
    var opts = this._make_options(false, options);
    opts.annotations.azk.shell = (options.shell_type || (options.interactive ? 'interactive' : 'script'));
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
      mounts: {},
      envs: {},
      ports: {},
      sequencies: {},
      docker: null
    });
    var envs = _.merge({}, this.envs, this._envs_from_file(), options.envs);
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
    var mounts = _.merge({}, this.mounts, this._mounts_to_volumes(options.mounts));
    return {
      daemon: daemon,
      ports: ports,
      stdout: options.stdout,
      command: options.command || this.command,
      volumes: mounts,
      working_dir: options.workdir || this.workdir,
      env: envs,
      dns: net.nameServers(),
      docker: options.docker || this.options.docker_extra || null,
      annotations: {azk: {
          type: type,
          mid: this.manifest.namespace,
          sys: this.name,
          seq: (options.sequencies[type] || 1)
        }}
    };
  },
  _envs_from_file: function() {
    var envs = {};
    var file = path.join(this.manifest.manifestPath, '.env');
    if (fs.existsSync(file)) {
      var content = fs.readFileSync(file).toString();
      _.each(content.split('\n'), (function(entry) {
        if (entry.match(/.*=.*/)) {
          entry = entry.split('=');
          envs[entry[0]] = entry[1];
        }
      }));
    }
    return envs;
  },
  _parse_ports: function(ports) {
    return _.reduce(ports, (function(ports, port, name) {
      if (port == null)
        return ports;
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
      _keep_key: function(key) {
        return "#{" + key + "}";
      },
      system: {
        name: this.name,
        persistent_folders: "/data"
      },
      manifest: {
        dir: this.manifest.manifestDirName,
        path: this.manifest.manifestPath,
        project_name: this.manifest.manifestDirName
      },
      azk: {
        default_domain: config('agent:balancer:host'),
        balancer_port: config('agent:balancer:port'),
        balancer_ip: config('agent:balancer:ip')
      }
    };
    var template = this._replace_keep_keys(JSON.stringify(options));
    return JSON.parse(utils.template(template, data));
  },
  _replace_keep_keys: function(template) {
    var regex = /(?:(?:[#|$]{|<%)[=|-]?)\s*((?:envs|net)\.[\S]+?)\s*(?:}|%>)/g;
    return template.replace(regex, "#{_keep_key('$1')}");
  },
  _mounts_to_volumes: function(mounts) {
    var $__0 = this;
    var volumes = {};
    mounts = _.reduce(this.raw_mount_folders, (function(mounts, point, target) {
      mounts[point] = {
        type: 'path',
        value: target
      };
      return mounts;
    }), mounts);
    mounts = _.reduce(this.options.persistent_folders, (function(mounts, point) {
      mounts[point] = {
        type: 'persistent',
        value: path.join($__0.name, point)
      };
      return mounts;
    }), mounts);
    var persist_base = config('paths:persistent_folders');
    persist_base = path.join(persist_base, this.manifest.namespace);
    return _.reduce(mounts, (function(volumes, mount, point) {
      if (_.isString(mount)) {
        mount = {
          type: 'path',
          value: mount
        };
      }
      var target = null;
      switch (mount.type) {
        case 'path':
          target = mount.value;
          if (!target.match(/^\//)) {
            target = path.resolve($__0.manifest.manifestPath, target);
          }
          target = (fs.existsSync(target)) ? utils.docker.resolvePath(target) : null;
          break;
        case 'persistent':
          target = path.join(persist_base, mount.value);
          break;
      }
      if (!_.isEmpty(target)) {
        volumes[point] = target;
      }
      return volumes;
    }), volumes);
  }
}, {});
module.exports = {
  get System() {
    return System;
  },
  __esModule: true
};
//# sourceMappingURL=index.js.map