import { _, t, path, fs, utils, isBlank, lazy_require } from 'azk';
import { version, config } from 'azk';
import { net } from 'azk/utils';

var lazy = lazy_require({
  Image    : ['azk/images'],
  Run      : ['azk/system/run'],
  Scale    : ['azk/system/scale'],
  Balancer : ['azk/system/balancer'],
  replaceEnvs : ['azk/utils/shell']
});

var XRegExp = require('xregexp').XRegExp;
var regex_port = new XRegExp(
  "(?<public>[0-9]{1,})(:(?<private>[0-9]{1,})){0,1}(/(?<protocol>tcp|udp)){0,1}", "x"
);

export class System {
  constructor(manifest, name, image, options = {}) {
    this.manifest  = manifest;
    this.name      = name;

    if (_.isString(image)) {
      image = { docker: image };
      this.deprecatedImage = true;
    }

    image.system = this;
    this.image   = new lazy.Image(image);

    // Options
    this.__options = {};
    this.options   = _.merge({}, this.default_options, options);

    var raw = this.options.raw;
    delete this.options.raw;
    this.options     = this._expand_template(this.options);
    this.options.raw = raw;
  }

  get image_name_suggest() {
    return `${config('docker:build_name')}/${this.manifest.namespace}-${this.name}`;
  }

  set options(values) {
    this.__options = values;
  }

  get options() {
    return this.__options;
  }

  get default_options() {
    return {
      shell    : null,
      depends  : [],
      envs     : {},
      scalable : false,
    };
  }

  // System run operations
  runShell(...args) { return lazy.Run.runShell(this, ...args); }
  runDaemon(...args) { return lazy.Run.runDaemon(this, ...args); }
  runProvision(...args) { return lazy.Run.runProvision(this, ...args); }
  runWatch(...args) { return lazy.Run.runWatch(this, ...args); }
  stopWatching(...args) { return lazy.Run.stopWatching(this, ...args); }
  stop(...args) { return lazy.Run.stop(this, ...args); }
  instances(...args) { return lazy.Run.instances(this, ...args); }
  throwRunError(...args) { return lazy.Run.throwRunError(this, ...args); }

  // Scale operations
  start(...args) { return lazy.Scale.start(this, ...args); }
  scale(...args) { return lazy.Scale.scale(this, ...args); }
  killAll(...args) { return lazy.Scale.killAll(this, ...args); }
  checkDependsAndReturnEnvs(...args) { return lazy.Scale.checkDependsAndReturnEnvs(this, ...args); }

  // Save provision info
  get provision_steps() {
    var steps = this.options.provision || [];
    if (!_.isArray(steps)) {
      steps = [];
    }
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
    return this.options.command;
  }

  get workdir() {
    return this.options.workdir || "/";
  }

  // Get options
  get shell() { return this.options.shell; }
  get namespace() {
    return this.manifest.namespace + '-sys.' + this.name;
  }

  // Scale options
  get scalable() {
    var _scalable = this.options.scalable;

    if (_.isNumber(_scalable)) {
      _scalable = { default: _scalable };
    } else if (!_.isObject(_scalable)) {
      _scalable = _scalable ? { } : { limit: 1 };
    }

    return _.defaults(_scalable, {
      default: 1, limit: -1
    });
  }

  get disabled() {
    return this.scalable.default === 0 && this.scalable.limit === 0;
  }

  get auto_start() {
    return this.scalable.default !== 0;
  }

  get wait() {
    var wait_opts;
    if (_.isNumber(this.options.wait)) {
      wait_opts = {
        // wait in seconds
        timeout: this.options.wait * 1000
      };
      return wait_opts;
    } else if (this.options.wait) {
      // will be deprecated: now, timeout is the max timeout to wait
      wait_opts = {
        timeout: this.options.wait.retry * this.options.wait.timeout
      };
      return wait_opts;
    } else {
      return {};
    }
  }

  get wait_scale() {
    var wait = this.wait;
    return _.isEmpty(wait) && wait !== false ? true : wait;
  }

  // Ports and host
  get http() { return this.options.http || {}; }
  get hosts() {
    var hostnames = this.http.domains || [config('agent:balancer:host')];

    // v0.5.1 support
    if (!_.isEmpty(this.http.hostname)) {
      hostnames = [this.http.hostname];
    }

    hostnames = _.filter(hostnames, (hostname) => { return !_.isEmpty(hostname); })
      .map((hostname) => hostname.toLowerCase());

    return hostnames;
  }

  get hostname() {
    return this.hosts[0];
  }

  get balanceable() {
    var ports = this.ports;
    return ports.http && !_.isEmpty(this.http);
  }

  get url() {
    var host = this.hostname;
    var port = parseInt(config('agent:balancer:port'));
    return `http://${host}${ port == 80 ? '' : ':' + port }`;
  }

  backends() { return lazy.Balancer.list(this); }

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

  get dns_servers() {
    return this.options.dns_servers;
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

  get syncs() {
    return this._mounts_to_syncs(this.options.mounts || {});
  }

  // Get depends info
  get depends() { return this.options.depends; }
  get dependsInstances() {
    return _.map(this.depends, (depend) => {
      return this.manifest.system(depend, true);
    });
  }

  printableCommand(data, image_conf = {}) {
    var command = utils.requireArray(data.Config.Cmd);
    if (!_.isEmpty(image_conf.Entrypoint)) {
      var entry = utils.requireArray(image_conf.Entrypoint);
      command = entry.concat(command);
    }
    return JSON.stringify(command);
  }

  // Docker run options generator
  daemonOptions(options = {}, image_conf = {}) {
    // Merge ports
    options.ports = _.merge({}, this.ports, options.ports);
    options.ports_order = _.map(options.ports, (port, name) => {
      return !_.isEmpty(port) && name;
    });

    // Make command
    options.command = this._daemon_command(options, image_conf);

    // Load configs from image
    if (image_conf) {
      // WorkingDir
      if (_.isEmpty(this.options.workdir) && _.isEmpty(options.workdir)) {
        options.workdir = image_conf.WorkingDir;
      }

      // ExposedPorts
      var ports = _.reduce(options.ports, (ports, value, key) => {
        if (isBlank(value)) {
          value = `${key}/tcp`;
        }
        ports[key] = value;
        return ports;
      }, {});

      _.each(image_conf.ExposedPorts, (_config, port) => {
        var have = _.find(ports, (value) => {
          return value.match(new RegExp(`${parseInt(port)}\/(tcp|udp)$`));
        });

        if (!have) {
          options.ports[port] = port;
          options.ports_order.push( port );
        }
      });
    }

    // Clear null ports
    options.ports = _.reduce(options.ports, (ports, value, key) => {
      if (!isBlank(value)) {
        ports[key] = value;
      }
      return ports;
    }, {});

    return this._make_options(true, options, image_conf);
  }

  shellOptions(options = {}, image_conf = {}) {
    options = _.defaults(options, {
      interactive: false,
    });

    options.command = this._shell_command(options);
    var opts = this._make_options(false, options, image_conf);

    // Shell extra options
    opts.annotations.azk.shell = (
        options.shell_type ||
        (options.interactive ? 'interactive' : 'script')
    );

    _.assign(opts, {
      tty    : options.interactive ? options.stdout.isTTY : false,
      stdout : options.stdout,
      stderr : options.stderr || options.stdout,
      stdin  : options.interactive ? (options.stdin) : null,
    });

    return opts;
  }

  // Private methods
  _make_options(daemon, options = {}, image_conf = {}) {
    // Default values
    options = _.defaults(options, {
      workdir: this.options.workdir,
      mounts: {},
      envs: {},
      ports: {},
      ports_order: [],
      sequencies: {},
      docker: null,
      verbose: false,
      dns_servers: this.options.dns_servers,
    });

    var img_envs = {};
    _.forEach(image_conf.Env, (env_data) => {
      env_data = env_data.split("=");
      img_envs[env_data[0]] = env_data[1];
    });

    // Map ports to docker configs: ports and envs
    var envs  = _.merge({}, img_envs, this.envs, this._envs_from_file(), options.envs);
    var ports = {};
    var parsed_ports = this._parse_ports(options.ports);

    var ports_orderly = _.compact(_.map(options.ports_order, (key) => {
      return parsed_ports[key];
    }));

    _.each(parsed_ports, (data, name) => {
      if (!name.match(/\//)) {
        var env_key = `${name.toUpperCase()}_PORT`;
        if (!envs[env_key]) {
          envs[env_key] = data.private;
        }
      }
      ports[data.name] = [data.config];
    });

    // Make mounts options
    var type   = daemon ? "daemon" : "shell";
    var mounts = _.merge(
      {}, this._mounts_to_volumes(this.options.mounts || {}, daemon),
      this._mounts_to_volumes(options.mounts, daemon)
    );

    var dns_servers = [];

    if (!_.isEmpty(options.dns_servers)) {
      dns_servers = net.nameServers(options.dns_servers);
    } else {
      dns_servers = net.nameServers();
    }

    var finalOptions = {
      daemon: daemon,
      command: options.command,
      verbose: options.verbose,
      ports: ports,
      ports_orderly: ports_orderly,
      volumes: mounts,
      working_dir: options.workdir || this.workdir,
      dns: dns_servers,
      extra: options.docker || this.options.docker_extra || {},
      annotations: { azk: {
        type : type,
        mid  : this.manifest.namespace,
        sys  : this.name,
        seq  : (options.sequencies[type] || 1),
      }}
    };

    // Expand envs
    finalOptions = this._expand_envs(finalOptions, envs);

    // Not expand and not stringify
    finalOptions.env = envs;
    finalOptions.stdout = options.stdout;

    return finalOptions;
  }

  _expand_envs(options, envs) {
    // https://regex101.com/r/zX1qU4/1
    var keep_special = /\${((?:[^\d]*?[@?\#])|(?:\d*?))}/g;

    // Prepare template
    var template = JSON.stringify(options);
    template = lazy.replaceEnvs(template, "#{envs.$1}", true);
    template = template.replace(keep_special, "#{_keep_special('$1')}");

    // Replaces
    var expanded = utils.template(template, {
      envs,
      _keep_special: (special) => `\${${special}}`,
    });

    // Parse result
    return JSON.parse(expanded);
  }

  _shell_command(options) {
    // Set a default shell
    // cmd.shell have preference over system.shell
    var default_shell = _.isEmpty(this.shell) ? "/bin/sh" : this.shell;
    if (!_.isEmpty(options.shell)) { default_shell = options.shell; }

    var command = options.command;

    // shell args (aka: --)
    if (!_.isEmpty(options.shell_args)) {
      command = utils.requireArray(options.shell_args);
    }

    if (!_.isEmpty(command)) {
      command = [default_shell, "-c", utils.joinCmd(command)];
    } else {
      command = [default_shell];
    }

    return command;
  }

  _daemon_command(options, image_conf) {
    var command         = options.command || this.command;
    var empty_img_cmd   = _.isEmpty(image_conf.Cmd);
    var empty_img_entry = _.isEmpty(image_conf.Entrypoint);
    var empty_cmd       = _.isEmpty(command);
    var cmd_not_set     = `echo ${t("system.cmd_not_set", { system: this.name })}; exit 1`;

    if (empty_img_entry && _.isString(command)) {
      command = ["/bin/sh", "-c", command];
    } else if (!empty_img_entry && _.isString(command)) {
      command = utils.splitCmd(command);
    } else if (empty_img_entry && empty_cmd && empty_img_cmd) {
      command = ["/bin/sh", "-c", cmd_not_set];
    } else if (empty_cmd) {
      command = empty_img_cmd ? [] : image_conf.Cmd;
    }

    return command;
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
      if (isBlank(port)) {
        return ports;
      }

      port = XRegExp.exec(port, regex_port);
      port.protocol = port.protocol || "tcp";

      // TODO: Add support a bind ip
      var conf = { HostIp: config("agent:dns:ip") };
      if (_.isEmpty(port.private)) {
        port.private = port.public;
        port.public  = null;
      }

      if (!_.isEmpty(port.public)) {
        conf.HostPort = port.public;
      }

      ports[name] = {
        config : conf,
        key    : name,
        name   : port.private + "/" + port.protocol,
        private: port.private
      };
      return ports;
    }, {});
  }

  _expand_template(options) {
    var data = {
      _keep_key(key, token = "#") {
        return `${token}{${key}}`;
      },
      system: {
        name: this.name,
      },
      manifest: {
        dir : this.manifest.manifestDirName,
        path: this.manifest.manifestPath,
        project_name: this.manifest.manifestDirName,
      },
      azk: {
        version       : version,
        default_domain: config('agent:balancer:host'),
        default_dns   : net.nameServers(),
        dns_port      : config('agent:dns:port'),
        balancer_port : config('agent:balancer:port'),
        balancer_ip   : config('agent:balancer:ip'),
      },
      env: process.env,
    };

    var template = this._replace_keep_keys(JSON.stringify(options));
    return JSON.parse(utils.template(template, data));
  }

  _replace_keep_keys(str) {
    // https://regex101.com/r/gF4uT4/1
    let net_envs = /(?:(?:[#|$]{|<%)[=|-]?)\s*((?:envs|net)\.[\S]+?)\s*(?:}|%>)/g;
    str = str.replace(net_envs, "#{_keep_key('$1')}");
    return lazy.replaceEnvs(str, "#{_keep_key('$1', '$')}", true);
  }

  _resolved_path(mount_path) {
    if (!mount_path) {
      return this.manifest.manifestPath;
    }
    return path.resolve(this.manifest.manifestPath, mount_path);
  }

  _mounts_to_volumes(mounts, daemon = true) {
    var volumes = {};

    // persistent folder
    var persist_base = config('paths:persistent_folders');
    persist_base = path.join(persist_base, this.manifest.namespace);

    return _.reduce(mounts, (volumes, mount, point) => {
      if (_.isString(mount)) {
        mount = { type: 'path', value: mount };
      }

      mount.options = _.defaults(mount.options || {}, {resolve: true});

      let target = null;
      let path_fn = () => {
        target = mount.value;

        if (mount.options.resolve) {
          if (!target.match(/^\//)) {
            target = this._resolved_path(target);
          }

          target = (fs.existsSync(target)) ?
            utils.docker.resolvePath(target) : null;
        }
      };

      switch (mount.type) {
        case 'persistent':
          target = path.join(persist_base, mount.value);
          break;

        case 'sync':
          if (daemon && mount.options.daemon !== false ||
             !daemon && mount.options.shell === true) {
            target = this.sync_folder(point);
          } else {
            path_fn();
          }
          break;

        case 'path':
          path_fn();
          break;
      }

      if (!_.isEmpty(target)) {
        volumes[point] = target;
      }

      return volumes;
    }, volumes);
  }

  sync_folder(point = '') {
    let id = utils.calculateHash(path.join(this.name, point));
    return path.join(config('paths:sync_folders'), this.manifest.namespace, id);
  }

  _mounts_to_syncs(mounts) {
    return _.reduce(mounts, (syncs, mount, mount_key) => {
      if (mount.type === 'sync') {
        var mounted_subpaths = _.reduce(mounts, (subpaths, mount, dir) => {
          if ( dir !== mount_key && dir.indexOf(mount_key) === 0) {
            let regex = new RegExp(`^${mount_key}`);
            let exclude = `/${path.normalize(dir.replace(regex, './'))}`;
            subpaths.push(exclude);
          }
          return subpaths;
        }, []);

        mount.options        = mount.options || {};
        mount.options.except = _.uniq(_.flatten([mount.options.except || []])
          .concat(mounted_subpaths)
          .concat(['.syncignore', '.gitignore', '.azk/', '.git/']));

        var host_sync_path = this._resolved_path(mount.value);
        syncs[host_sync_path] = {
          guest_folder  : this.sync_folder(mount_key),
          options       : mount.options,
        };
      }
      return syncs;
    }, {});
  }
}
