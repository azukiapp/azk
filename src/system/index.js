import { _, t, config, path, async, Q } from 'azk';
import { Image } from 'azk/images';
import { net } from 'azk/utils';
import { XRegExp } from 'xregexp';

import { Run } from 'azk/system/run';
import { Scale } from 'azk/system/scale';

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
    return {
      shell    : "/bin/sh",
      depends  : [],
      envs     : {},
      scalable : false,
    }
  }

  // System run operations
  runShell(...args) { return Run.runShell(this, ...args); }
  runDaemon(...args) { return Run.runDaemon(this, ...args); }
  stop(...args) { return Run.stop(this, ...args); }

  // Scale operations
  scale(...args) { return Scale.scale(this, ...args); }
  instances(...args) { return Scale.instances(this, ...args); }

  // Options with default
  get command() {
    var command = this.options.command;
    if (_.isEmpty(command)) {
      var msg = t("system.cmd_not_set", {system: this.name});
      command = [this.shell, "-c", `echo "${msg}"; exit 1`];
    } else {
      command = [this.shell, "-c", command];
    }

    return command;
  }

  get workdir() {
    return this.options.workdir || "/";
  }

  // Get options
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

  // Docker run options generator
  daemonOptions(options = {}) {
    // Load configs from image
    if (options.image_data) {
      var config = options.image_data.Config;

      // Cmd
      if(_.isEmpty(this.options.command) && _.isEmpty(options.command)) {
        options.command = config.Cmd;
      }

      // WorkingDir
      if(_.isEmpty(this.options.workdir) && _.isEmpty(options.workdir)) {
        options.workdir = config.WorkingDir;
      }

      // ExposedPorts
      if(_.isEmpty(this.options.ports) && _.isEmpty(options.ports)) {
        options.ports = _.reduce(config.ExposedPorts, (ports, config, port) => {
          ports[port] = port;
          return ports;
        }, {});
      }
    }

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
      command: options.command || this.command,
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
