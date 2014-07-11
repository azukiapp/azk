"use strict";
var __moduleName = "src/system/index";
var $__2 = require('azk'),
    _ = $__2._,
    t = $__2.t,
    config = $__2.config,
    path = $__2.path;
var Image = require('azk/images').Image;
var net = require('azk/utils').net;
var Run = require('azk/system/run').Run;
var System = function System(manifest, name, image) {
  var options = arguments[3] !== (void 0) ? arguments[3] : {};
  this.manifest = manifest;
  this.name = name;
  this.image = new Image(image);
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
      envs: {}
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
  get namespace() {
    return this.manifest.namespace + '-sys.' + this.name;
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
    return this._make_options(true, options);
  },
  shellOptions: function() {
    var options = arguments[0] !== (void 0) ? arguments[0] : {};
    options = _.defaults(options, {interactive: false});
    var opts = this._make_options(false, options);
    opts.annotations.shell = options.interactive ? 'interactive' : 'script';
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
      evns: {},
      sequencies: {}
    });
    var type = daemon ? "daemon" : "shell";
    return {
      daemon: daemon,
      ports: {},
      volumes: _.merge({}, this.volumes, options.volumes),
      local_volumes: _.merge({}, this.persistent_volumes, options.local_volumes),
      working_dir: options.workdir || this.workdir,
      env: _.merge({}, this.envs, options.envs),
      dns: net.nameServers(),
      annotations: {azk: {
          type: type,
          sys: this.name,
          seq: (options.sequencies[type] || 0) + 1
        }}
    };
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