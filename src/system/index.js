import { _, t, config, path } from 'azk';
import { Image } from 'azk/images';
import { net } from 'azk/utils';

export class System {
  constructor(manifest, name, image, options = {}) {
    this.manifest = manifest;
    this.name     = name;
    this.image    = new Image(image);
    this.options  = _.merge({}, this.default_options, options);
    this.options  = this._expand_template(this.options);
  }

  get default_options() {
    var msg = t("system.cmd_not_set", {system: this.name});
    return {
      command : `echo "${msg}"; exit 1`,
      shell   : "/bin/sh",
      depends : [],
      workdir : "/",
      envs    : {},
    }
  }

  // Get options
  get command()           { return this.options.command };
  get workdir()           { return this.options.workdir };
  get shell()             { return this.options.shell };
  get raw_mount_folders() { return this.options.mount_folders };
  get namespace() {
    return this.manifest.namespace + '-sys.' + this.name;
  }

  // Envs
  get envs() { return this.options.envs; }

  // Volumes options
  get volumes() {
    var volumes = { };

    // Volumes
    _.each(this.raw_mount_folders, (target, point) => {
      point = path.resolve(this.manifest.manifestPath, point);
      volumes[point] = target;
    });

    return volumes;
  }

  get persistent_volumes() {
    var folders = {};
    var key  = config('agent:requires_vm') ? 'agent:vm' : 'paths';
    var base = config(key + ':persistent_folders');

    return _.reduce(this.options.persistent_folders, (folders, folder) => {
      var origin = path.join(base, this.manifest.namespace, this.name, folder);
      folders[origin] = folder;
      return folders;
    }, {});
  }

  // Get depends info
  get depends() { return this.options.depends };
  get dependsInstances() {
    return _.map(this.depends, (depend) => {
      return this.manifest.system(depend, true);
    });
  };

  // Docker run options generator
  daemonOptions(options = {}) {
    return this._make_options(true, options);
  }

  shellOptions(options = {}) {
    options = _.defaults(options, {
      interactive: false,
    })
    var opts = this._make_options(false, options);

    // Shell extra options
    opts.annotations.shell = options.interactive ? 'interactive' : 'script';
    _.merge(opts, {
      tty   : options.interactive ? options.stdout.isTTY : false,
      stdout: options.stdout,
      stderr: options.stderr || options.stdout,
      stdin : options.interactive ? (options.stdin) : null,
    });

    return opts;
  }

  // Private methods
  _make_options(daemon, options = {}) {
    // Default values
    options = _.defaults(options, {
      workdir: this.options.workdir,
      volumes: {},
      local_volumes: {},
      evns: {},
      sequencies: {},
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
      annotations: {
        type : type,
        sys  : this.name,
        seq  : (options.sequencies[type] || 0) + 1,
      }
    }
  }

  _expand_template(options) {
    var data = {
      system: {
        name: this.name,
        persistent_folders: "/data",
      },
      manifest: {
        dir: this.manifest.manifestDirName,
        project_name: this.manifest.manifestDirName,
      },
      azk: {
        default_domain: config('agent:balancer:host'),
        balancer_port: config('agent:balancer:port'),
        balancer_ip: config('agent:balancer:ip'),
      }
    };
    return JSON.parse(_.template(JSON.stringify(options), data));
  }
}
