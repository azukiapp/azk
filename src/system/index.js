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

  // Get depends info
  get depends() { return this.options.depends };
  get dependsInstances() {
    return _.map(this.depends, (depend) => {
      return this.manifest.system(depend, true);
    });
  };

  // Docker run options
  daemonOptions(options = {}) {
    return this._make_options(true, options);
  }

  shellOptions(options = {}) {
    return this._make_options(false, options);
  }

  _make_options(daemon, options = {}) {
    // Default values
    options = _.defaults(options, {
      workdir: this.options.workdir,
      volumes: {},
      evns: {},
    });

    //var name = this.namespace + (daemon ? 'type.daemon' : 'type.exec');
    var run_options = {
      daemon: daemon,
      ports: {},
      volumes: _.merge({}, this.volumes, options.volumes),
      working_dir: options.workdir || this.workdir,
      env: _.merge({}, this.envs, options.envs),
      dns: net.nameServers(),
    }

    // Daemon or exec mode?
    //if (!daemon) {
      //name += opts.interactive ? '.interactive' : '.raw';
      //_.merge(run_options, {
        //tty: opts.interactive ? opts.stdout.isTTY : false,
        //stdout: opts.stdout,
        //stderr: opts.stderr || opts.stdout,
        //stdin: opts.interactive ? (opts.stdin) : null,
      //});
    //}

    // Persistent dir
    //run_options.local_volumes = _.merge(
      //{}, run_options.local_volumes, this.persistent_folders
    //);

    //run_options.ns = name;
    return run_options;
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
