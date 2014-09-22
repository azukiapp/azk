import { _, t, config, path, async, Q, fs, utils } from 'azk';
import { Image } from 'azk/images';
import { net } from 'azk/utils';
import { XRegExp } from 'xregexp';

import { Run } from 'azk/system/run';
import { Scale } from 'azk/system/scale';
import { Balancer } from 'azk/system/balancer';

var regex_port = new XRegExp(
  "(?<private>[0-9]{1,})(:(?<public>[0-9]{1,})){0,1}(/(?<protocol>tcp|udp)){0,1}", "x"
);

export class System {
  constructor(manifest, name, image, options = {}) {
    this.manifest  = manifest;
    this.name      = name;
    this.image     = new Image(image);

    // Options
    this.__options = {}
    this.options   = _.merge({}, this.default_options, options);
    this.options   = this._expand_template(this.options);
  }

  set options(values) {
    this.__options = values;
  }

  get options() {
    return this.__options;
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
  runProvision(...args) { return Run.runProvision(this, ...args); }
  stop(...args) { return Run.stop(this, ...args); }
  instances(...args) { return Run.instances(this, ...args); }
  throwRunError(...args) { return Run.throwRunError(this, ...args); }

  // Scale operations
  start(...args) { return Scale.start(this, ...args); }
  scale(...args) { return Scale.scale(this, ...args); }
  killAll(...args) { return Scale.killAll(this, ...args); }
  checkDependsAndReturnEnvs(...args) { return Scale.checkDependsAndReturnEnvs(this, ...args); }

  // Save provision info
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

  // Options with default
  get raw_command() { return this.options.command; }
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
  get namespace() {
    return this.manifest.namespace + '-sys.' + this.name;
  }

  // Scale options
  get default_instances() {
    return (this.options.scalable || {}).default || 1;
  }
  get scalable() {
    return this.options.scalable ? true : false;
  }
  get wait_scale() {
    var wait = this.options.wait;
    return _.isEmpty(wait) && wait != false ? true : wait;
  }

  // Ports and host
  get hostname() {
    return (this.options.http || {}).hostname || config('agent:balancer:host');
  }
  get balanceable() {
    var ports = this.ports;
    return ports.http && (this.options.http || {}).hostname;
  }

  get url() {
    var host = this.hostname;
    var port = parseInt(config('agent:balancer:port'));
    return `http://${host}${ port == 80 ? '' : ':' + port }`;
  }

  get hosts() { return [this.hostname]; }
  backends() { return Balancer.list(this); }

  get http_port() {
    var ports = this._parse_ports(this.ports);
    return ports.http.private;
  }

  portName(sought) {
    var ports = this._parse_ports(this.ports);
    var name  = sought;

    _.each(ports, (port, port_name) => {
      if (parseInt(sought) == parseInt(port.private)) {
        name = port_name;
      }
    });

    return name;
  }

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
  expandExportEnvs(data) {
    var ports, envs = {};

    // Defaults options
    data = _.defaults(data, { envs: {}, net: {}, });
    data.net = _.defaults(data.net, { host: this.hostname, port: {}, });

    // ports from instances
    _.each(data.net.port, (port_public, port_private) => {
      var key_port = (`${this.name}_${port_private}_PORT`).toUpperCase();
      var key_host = (`${this.name}_${port_private}_HOST`).toUpperCase();
      envs[key_port] = port_public;
      envs[key_host] = data.net.host;
    });

    // ports from system ports options
    ports = this._parse_ports(this.ports);
    _.each(ports, (config, name) => {
      var port     = data.net.port[config.private];
      var key_port = (`${this.name}_${name}_PORT`).toUpperCase();
      var key_host = (`${this.name}_${name}_HOST`).toUpperCase();
      data.net.port[name] = port;
      if (port && _.isEmpty(data.envs[key_port])) {
        envs[key_port] = port;
      }
      if (_.isEmpty(data.envs[key_host])) {
        envs[key_host] = data.net.host;
      }
    });

    // http ports
    var key = this.env_key('URL');
    if (ports.http && _.isEmpty(envs[key])) {
      envs[key] = `http://${data.net.host}`;
    }

    envs = _.reduce(this.options.export_envs || {}, (envs, value, key) => {
      envs[key.toUpperCase()] = value;
      return envs;
    }, envs);

    return JSON.parse(utils.template(JSON.stringify(envs), data));
  }

  env_key(...args) {
    return (`${this.name}_${[...args].join("_")}`).toUpperCase();
  }

  // Mounts options
  get mounts() {
    return this._mounts_to_volumes(this.options.mounts || {});
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
    // Merge ports
    options.ports = _.merge({}, this.ports, options.ports);

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
      var ports = _.reduce(options.ports, (ports, value, key) => {
        if (value == null) { value = `${key}/tcp`; }
        ports[key] = value;
        return ports;
      }, {});

      _.each(config.ExposedPorts, (_config, port) => {
        var have = _.find(ports, (value, key) => {
          return value.match(new RegExp(`${parseInt(port)}\/(tcp|udp)$`));
        });

        if (!have) { options.ports[port] = port; }
      });
    }

    // Clear null ports
    options.ports = _.reduce(options.ports, (ports, value, key) => {
      if (value != null) {
        ports[key] = value;
      }
      return ports;
    }, {});

    return this._make_options(true, options);
  }

  shellOptions(options = {}) {
    options = _.defaults(options, {
      interactive: false,
    });

    var opts = this._make_options(false, options);

    // Shell extra options
    opts.annotations.azk.shell = (
        options.shell_type ||
        (options.interactive ? 'interactive' : 'script')
    )
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
      mounts: {},
      envs: {},
      ports: {},
      sequencies: {},
      docker: null,
    });

    // Map ports to docker configs: ports and envs
    var envs  = _.merge({}, this.envs, this._envs_from_file(), options.envs);
    var ports = {};
    _.each(this._parse_ports(options.ports), (data, name) => {
      if (!name.match(/\//)) {
        var env_key = `${name.toUpperCase()}_PORT`;
        if (!envs[env_key]) envs[env_key] = data.private;
      }
      ports[data.name] = [data.config];
    });

    var type   = daemon ? "daemon" : "shell";
    var mounts = _.merge(
      {}, this.mounts,
      this._mounts_to_volumes(options.mounts)
    );

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
      annotations: { azk: {
        type : type,
        mid  : this.manifest.namespace,
        sys  : this.name,
        seq  : (options.sequencies[type] || 1),
      }}
    };
  }

  _envs_from_file() {
    var envs = {};
    var file = path.join(this.manifest.manifestPath, '.env');

    if (fs.existsSync(file)) {
      var content = fs.readFileSync(file).toString();
      _.each(content.split('\n'), (entry) => {
        if (entry.match(/.*=.*/)) {
          entry = entry.split('=');
          envs[entry[0]] = entry[1];
        }
      });
    }

    return envs;
  }

  // Parse azk ports configs
  _parse_ports(ports) {
    return _.reduce(ports, (ports, port, name) => {
      // skip disable
      if (port == null) return ports;

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
      _keep_key(key) {
        return "#{" + key + "}";
      },
      system: {
        name: this.name,
        persistent_folders: "/data",
      },
      manifest: {
        dir: this.manifest.manifestDirName,
        path: this.manifest.manifestPath,
        project_name: this.manifest.manifestDirName,
      },
      azk: {
        default_domain: config('agent:balancer:host'),
        balancer_port: config('agent:balancer:port'),
        balancer_ip: config('agent:balancer:ip'),
      }
    };

    var template = this._replace_keep_keys(JSON.stringify(options));
    return JSON.parse(utils.template(template, data));
  }

  _replace_keep_keys(template) {
    var regex = /(?:(?:[#|$]{|<%)[=|-]?)\s*((?:envs|net)\.[\S]+?)\s*(?:}|%>)/g;
    return template.replace(regex, "#{_keep_key('$1')}");
  }

  _mounts_to_volumes(mounts) {
    var volumes = {};

    // support mount_folders
    mounts = _.reduce(this.raw_mount_folders, (mounts, point, target) => {
      mounts[point] = { type: 'path', value: target };
      return mounts;
    }, mounts);

    // support persistent_folders
    mounts = _.reduce(this.options.persistent_folders, (mounts, point) => {
      mounts[point] = { type: 'persistent', value: path.join(this.name, point) };
      return mounts;
    }, mounts);

    // persistent folder
    var persist_base = config('paths:persistent_folders');
    persist_base = path.join(persist_base, this.manifest.namespace);

    return _.reduce(mounts, (volumes, mount, point) => {
      if (_.isString(mount)) {
        mount = { type: 'path', value: mount }
      }

      var target = null;
      switch(mount.type) {
        case 'path':
          target = mount.value;
          if (!target.match(/^\//)) {
            target = path.resolve(this.manifest.manifestPath, target);
          }
          target = (fs.existsSync(target)) ?
            utils.docker.resolvePath(target) : null;
          break;
        case 'persistent':
          target = path.join(persist_base, mount.value);
          break;
      }

      if (!_.isEmpty(target)) {
        volumes[point] = target;
      }

      return volumes;
    }, volumes);
  }
}
