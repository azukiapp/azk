"use strict";
var __moduleName = "src/system/index";
var $__2 = require('azk'),
    _ = $__2._,
    t = $__2.t,
    config = $__2.config,
    path = $__2.path,
    async = $__2.async,
    Q = $__2.Q;
var Image = require('azk/images').Image;
var net = require('azk/utils').net;
var XRegExp = require('xregexp').XRegExp;
var Run = require('azk/system/run').Run;
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
    var msg = t("system.cmd_not_set", {system: this.name});
    return {
      command: ("echo \"" + msg + "\"; exit 1"),
      shell: "/bin/sh",
      depends: [],
      workdir: "/",
      envs: {},
      scalable: false
    };
  },
  runShell: function(command) {
    var options = arguments[1] !== (void 0) ? arguments[1] : {};
    return Run.run(this, command, this.shellOptions(options));
  },
  get command() {
    return this.options.command;
  },
  get workdir() {
    return this.options.workdir;
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
  checkImage: function() {
    var pull = arguments[0] !== (void 0) ? arguments[0] : true;
    return async(this, function() {
      var $__0,
          promise,
          image;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__0 = this;
              if (pull) {
                promise = this.image.pull();
              } else {
                promise = this.image.check().then((function(image) {
                  if (image == null) {
                    throw new ImageNotAvailable($__0.name, $__0.image.name);
                  }
                  return image;
                }));
              }
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 2;
              return promise.progress((function(event) {
                event.system = $__0;
                return event;
              }));
            case 2:
              image = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.returnValue = image.inspect();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  daemonOptions: function() {
    var options = arguments[0] !== (void 0) ? arguments[0] : {};
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
      volumes: _.merge({}, this.volumes, options.volumes),
      local_volumes: _.merge({}, this.persistent_volumes, options.local_volumes),
      working_dir: options.workdir || this.workdir,
      env: envs,
      dns: net.nameServers(),
      annotations: {azk: {
          type: type,
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