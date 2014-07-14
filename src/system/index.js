import { _, t, config, path, async, Q } from 'azk';
import { Image } from 'azk/images';
import { net } from 'azk/utils';
import { XRegExp } from 'xregexp';

import { Run } from 'azk/system/run';

var regex_port = new XRegExp(
  "(?<private>[0-9]{1,})(:(?<public>[0-9]{1,})){0,1}(/(?<protocol>tcp|udp)){0,1}", "x"
);

export class System {
  constructor(manifest, name, image, options = {}) {
    this.manifest  = manifest;
    this.name      = name;
    this.image     = new Image(image);
    this.__options = options;
    this.options   = _.merge({}, this.default_options, options);
    this.options   = this._expand_template(this.options);
  }

  get default_options() {
    var msg = t("system.cmd_not_set", {system: this.name});
    return {
      command  : `echo "${msg}"; exit 1`,
      shell    : "/bin/sh",
      depends  : [],
      workdir  : "/",
      envs     : {},
      scalable : false,
    }
  }

  // System operations
  runShell(command, options = { }) {
    return Run.run(this, command, this.shellOptions(options));
  }

  // Get options
  get command()           { return this.options.command };
  get workdir()           { return this.options.workdir };
  get shell()             { return this.options.shell };
  get raw_mount_folders() { return this.options.mount_folders };
  get scalable()          { return this.options.scalable };
  get namespace() {
    return this.manifest.namespace + '-sys.' + this.name;
  }

  // Ports
  get ports() {
    var ports = this.options.ports || {};

    // Add http port
    if (_.isEmpty(ports.http) && this.options.http) {
      ports.http = "5000/tcp";
    }

    return ports;
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

  // Check and pull image
  checkImage(pull = true) {
    return async(this, function* () {
      if (pull) {
        var promise = this.image.pull();
      } else {
        var promise = this.image.check().then((image) => {
          if (image == null) {
            throw new ImageNotAvailable(this.name, this.image.name);
          }
          return image;
        });
      }

      var image = yield promise.progress((event) => {
        event.system = this;
        return event;
      });

      return image.inspect();
    });
  }

  // Docker run options generator
  daemonOptions(options = {}) {
    options.ports = _.merge({}, this.ports, options.ports);
    return this._make_options(true, options);
  }

  shellOptions(options = {}) {
    options = _.defaults(options, {
      interactive: false,
    });

    var opts = this._make_options(false, options);

    // Shell extra options
    opts.annotations.azk.shell = options.interactive ? 'interactive' : 'script';
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
      envs: {},
      ports: {},
      sequencies: {},
    });

    // Map ports to docker configs: ports and envs
    var envs  = _.merge({}, this.envs, options.envs);
    var ports = {};
    _.each(this._parse_ports(options.ports), (data, name) => {
      if (!name.match(/\//)) {
        var env_key = `${name.toUpperCase()}_PORT`;
        if (!envs[env_key]) envs[env_key] = data.private;
      }
      ports[data.name] = [data.config];
    });

    var type = daemon ? "daemon" : "shell";
    return {
      daemon: daemon,
      ports: ports,
      volumes: _.merge({}, this.volumes, options.volumes),
      local_volumes: _.merge({}, this.persistent_volumes, options.local_volumes),
      working_dir: options.workdir || this.workdir,
      env: envs,
      dns: net.nameServers(),
      annotations: { azk: {
        type : type,
        sys  : this.name,
        seq  : (options.sequencies[type] || 0) + 1,
      }}
    };
  }

  // Parse azk ports configs
  _parse_ports(ports) {
    return _.reduce(ports, (ports, port, name) => {
      port = XRegExp.exec(port, regex_port);
      port.protocol = port.protocol || "tcp";

      // TODO: Add support a bind ip
      var conf = { HostIp: config("agent:dns:ip") };
      if (port.public)
        conf.HostPort = port.public;

      ports[name] = {
        config : conf,
        name   : port.private + "/" + port.protocol,
        private: port.private
      };
      return ports;
    }, {});
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
