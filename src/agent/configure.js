import { _, t, os, log, lazy_require, fsAsync } from 'azk';
import { publish } from 'azk/utils/postal';
import { async, ninvoke, nfcall, thenAll } from 'azk/utils/promises';
import { config, set_config } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { AzkError, OSNotSupported, DependencyError } from 'azk/utils/errors';
import { net, envDefaultArray } from 'azk/utils';
import Azk from 'azk';

var which      = require('which');   // Search for command in path
var request    = require('request');
var semver     = require('semver');
var { isIPv4 } = require('net');

var lazy = lazy_require({
  docker     : ['azk/docker', 'default'],
  Migrations : ['azk/agent/migrations'],
  exec       : ['child_process'],
  Netmask    : ['netmask'],
  Sync       : ['azk/sync'],
});

var ports_tabs = {
  linux : ":",
  darwin: ".",
};

export class Configure extends UIProxy {
  constructor(user_interface) {
    super(user_interface);
    this.dns_tab   = ports_tabs[os.platform()];
    this.docker_ip = null;
  }

  // Run configures and checks by operational system
  run() {
    var method = this[os.platform()];
    if (method) {
      return method.apply(this);
    } else {
      throw new OSNotSupported(os.platform());
    }
  }

  // Mac OS X configure and checks
  // TODO: Check dependencies versions
  darwin() {
    return this._checksForRequiresVm();
  }

  // Linux configure and checks
  linux() {
    if (config('agent:requires_vm')) {
      return this._checksForRequiresVm();
    } else {
      var socket = config('docker:socket');
      return async(this, function* () {
        yield this._checkAzkVersion();
        yield lazy.Migrations.run(this);

        yield this._checkRsyncVersion();

        var dns_key = 'agent:dns:port';
        var balancer_key = 'agent:balancer:port';

        var ports = {
          dns: config(dns_key),
          balancer: config(balancer_key),
        };

        return _.merge(
          { 'agent:dns:port': ports.dns, 'agent:balancer:port': ports.balancer },
          yield this._checkDockerSocket(socket),
          yield this._checkAndConfigureNetwork(ports, false),
          yield this._cleanContainers(),
          yield this._checkPorts(ports.dns, dns_key, 'dns', 'AZK_DNS_PORT'),
          yield this._checkPorts(ports.balancer, balancer_key, 'balancer', 'AZK_BALANCER_PORT'),
          yield this._loadDnsServers()
        );
      })
      .catch(function (err) {
        // Unhandled rejection overtakes synchronous exception through done() #471
        // https://github.com/petkaantonov/bluebird/issues/471
        if (err instanceof AzkError) {
          this.fail(err.toString());
        }
      }.bind(this));
    }
  }

  _checksForRequiresVm() {
    return async(this, function* () {
      yield this._checkAzkVersion();
      yield lazy.Migrations.run(this);

      yield this._checkRsyncVersion();

      var ports = {
        dns: config('agent:dns:port'),
        balancer: config('agent:balancer:port'),
      };

      if (os.platform() === 'darwin' && ports.dns !== '53') {
        throw new DependencyError('custom_dns_port');
      }

      return _.merge(
        { 'agent:dns:port': ports.dns, 'agent:balancer:port': ports.balancer },
        yield this._which('VBoxManage'),
        yield this._checkAndConfigureNetwork(ports),
        yield this._checkAndGenerateSSHKeys(),
        yield this._loadDnsServers()
      );
    });
  }

  _checkAzkVersion() {
    return async(this, function* () {
      try {
        // check connectivity
        var currentOnline = yield net.isOnlineCheck();

        if ( !currentOnline ) {
          log.debug('isOnline == false');
          this.warning('configure.check_version_no_internet');
          return {}; //can't check version
        }

        // get AZK version from Github API
        var options = {
          headers: { 'User-Agent': 'request' },
          json: true,
        };

        publish("agent.configure.check_version.status", { type: "status", keys: "configure.check_version"});
        var [response, body] = yield ninvoke(request, 'get', config('urls:github:content:package_json'), options);
        var statusCode = response.statusCode;

        if (statusCode !== 200) {
          throw Error(t('configure.github_azk_version_error'));
        }

        var azkLatestVersion    = semver.clean(body.version);
        var newAzkVersionExists = semver.lt(Azk.version, azkLatestVersion);
        if ( newAzkVersionExists ) {
          // just warn user that new AZK version is available
          this.warning('errors.dependencies.*.upgrade', {
            current_version: Azk.version,
            new_version: azkLatestVersion
          });
        } else {
          this.ok('configure.latest_azk_version', { current_version: Azk.version });
        }
      } catch (err) {
        publish("agent.configure.check_version.status", {
          type: "status",
          status: "error",
          data: new Error(t("configure.check_version_error", {
            error_message: err.message || err,
            statusCode: statusCode
          })),
        });
      }

      return {};
    });
  }

  _checkRsyncVersion() {
    return async(this, function* () {
      // Check if installed
      yield this._which('rsync', 'rsync');

      // Check version
      var minRsyncVersion = (process.env.RSYNC_MIN_VERSION || '2.6.9');
      var currentRsyncVersion = yield lazy.Sync.version();
      var validRsyncVersion = semver.gte(currentRsyncVersion, minRsyncVersion);
      if ( !validRsyncVersion ) {
        throw new DependencyError('check_rsync_version_error', {
          current_version: currentRsyncVersion,
          min_version    : minRsyncVersion,
        });
      }
      return {};
    });
  }

  _cleanContainers() {
    return lazy.docker
      .azkListContainers()
      .then((containers) => {
        this.warning('configure.clean_containers', { count: containers.length });
        var removes = _.map(containers, (container) => {
          return lazy.docker
            .getContainer(container.Id)
            .remove({ force: true });
        });
        return thenAll(removes)
          .then(() => { return {}; });
      });
  }

  _checkDockerSocket(socket) {
    var host = `unix://${socket}`;
    set_config('docker:host', host);

    return lazy.docker
      .info()
      .then(() => {
        return { 'docker:host': host };
      });
  }

  _checkPorts(port, configKey, service, env) {
    return net
      .checkPort(port, this.docker_ip)
      .then((avaibly) => {
        if (!avaibly) {
          throw new DependencyError('port_error', {
            port: port,
            service: service,
            env: env
          });
        }
        return { [configKey]: port };
      });
  }

  _which(command, save_key = null) {
    return nfcall(which, command)
      .then((fullpath) => {
        if (save_key) {
          var obj = {};
          obj[save_key] = fullpath;
          return obj;
        }
      })
      .catch(() => {
        throw new DependencyError(command);
      });
  }

  // Check for ssh keys, used for connection vm
  _checkAndGenerateSSHKeys() {
    var file = config('agent:vm:ssh_key');
    return fsAsync.exists(file).then((exist) => {
      if (!exist) {
        this.info('configure.generating_key');
        var script = `
          set -x;
          ssh-keygen -t rsa -f ${file} -N ''; result=$?;
          set +x;
          echo "";
          exit $result;
        `;
        return this.execSh(script).then((code) => {
          if (code !== 0) {
            throw new DependencyError('ssh_keygen');
          } else {
            return code;
          }
        });
      }
    });
  }

  // Check vm ip is configurat
  _checkAndConfigureNetwork(services_ports, use_vm = true) {
    return async(this, function* () {
      var file   = config('agent:balancer:file_dns');
      var ip     = null;
      var result = {}, nameserver = null;

      // File exist? Get content
      var exist = yield fsAsync.exists(file);
      if (exist) {
        var content     = yield fsAsync.readFile(file);
        var nameservers = net.parseNameserver(content.toString());
        if (!_.isEmpty(nameservers)) { nameserver = nameservers[0]; }
      }

      // Check ip or generate a new one
      if (use_vm) {
        var vm_name = config("agent:vm:name");
        this._interfaces = yield net.getInterfacesIps(vm_name);
      }
      ip = yield this._checkAndSaveIp(nameserver, file, use_vm, services_ports);

      if (use_vm) { result['docker:host'] = `http://${ip}:2375`; }

      // Save to use in configure
      this.docker_ip = ip;

      // Save configuration
      var obj = {};
      obj['agent:vm:ip'] = ip;
      obj['agent:dns:ip'] = ip;
      obj['agent:balancer:ip'] = ip;
      return _.merge(obj, result);
    });
  }

  _checkAndSaveIp(nameserver, file, use_vm, services_ports) {
    return async(this, function* () {
      // Not exist or invalid content
      var dns_port = _.isObject(nameserver) ? nameserver.port : null;
      var unmatched_dns_port = dns_port !== services_ports.dns;

      var ip       = _.isObject(nameserver) ? nameserver.ip   : null;
      var conflict  = use_vm ? net.conflictInterface(ip, this._interfaces) : null;

      if (_.isEmpty(ip) || !_.isEmpty(conflict) || unmatched_dns_port) {
        if (use_vm) {
          var fail_data;
          if (!_.isEmpty(conflict)) {
            fail_data = { ip, inter_name: conflict.name, inter_ip: conflict.ip };
            this.fail('configure.errors.invalid_current_ip', fail_data);
          } else if (!_.isEmpty(dns_port) && unmatched_dns_port) {
            fail_data = { file, old: nameserver.port, new: services_ports.dns };
            this.fail('configure.errors.unmatched_dns_port', fail_data);
          } else {
            this.warning('configure.vm_ip_msg');
          }
          var suggestion = net.generateSuggestionIp(ip, this._interfaces);
          ip = yield this._getNetworkIp(suggestion);
        } else {
          ip = yield this._getDockerIp();
        }
        yield this._generateResolverFile(ip, services_ports.dns, file);
      }

      return ip;
    });
  }

  sudo_check() {
    return this._which('sudo', 'sudo')
      .then((sudo_path) => { return sudo_path.sudo; })
      .catch(() => { return ""; });
  }

  // Generate file /etc/resolver/*
  _generateResolverFile(ip, port, file) {
    // TODO: Fixing is not root and not have a sudo
    return this.execShWithSudo('network', (sudo_path) => {
      // Creating resolver file and adding ip (with sudo)
      this.info('configure.adding_ip', { ip, file });
      ip = `${ip}${this.dns_tab}${port}`;
      var result = `
        echo "" &&
        set -x &&
        ${sudo_path} mkdir -p /etc/resolver 2>/dev/null &&
        echo "# azk agent configure" | ${sudo_path} tee ${file} &&
        echo "nameserver ${ip}" | ${sudo_path} tee -a ${file} &&
        ${sudo_path} chown \$(id -u):\$(id -g) ${file} &&
        set +x &&
        echo ""
      `;
      return result;
    });
  }

  execShWithSudo(error_label, block) {
    return this.sudo_check().then((sudo_path) => {
      var script = block(sudo_path);
      // Call interactive shell (to support sudo)
      return this.execSh(script).then((code) => {
        if (code !== 0) {
          throw new DependencyError(error_label);
        } else {
          return code;
        }
      });
    });
  }

  // TODO: filter others /etc/resolver/* azk files
  _getNetworkIp(suggestion) {
    var question = {
      name    : 'ip',
      message : 'configure.ip_question',
      // default : config('agent:vm:ip'),
      default: suggestion,
      validate: (value) => {
        var data     = { ip: value };
        var invalids = {
          ip      : () => this.t('configure.errors.ip_invalid', data),
          loopback: () => this.t('configure.errors.ip_loopback', data),
          conflict: (conflict) => {
            var t_data = { ip: value, inter_name: conflict.name, inter_ip: conflict.ip };
            return this.t('configure.errors.ip_conflict', t_data);
          },
        };

        // Check is valid ip
        if (!isIPv4(value) || value === '0.0.0.0') { return invalids.ip(); }

        // Conflict loopback
        var lpblock = new lazy.Netmask('127.0.0.0/8');
        if (lpblock.contains(value)) { return invalids.loopback(); }

        // Conflict other interfaces
        var conflict = net.conflictInterface(value, this._interfaces);
        if (!_.isEmpty(conflict)) { return invalids.conflict(conflict); }

        return true;
      }
    };

    return this.prompt(question)
      .then((answers) => {
        return answers.ip;
      });
  }

  _getDockerIp() {
    // 2: docker0    inet 10.0.42.1/16 scope global docker0
    //        valid_lft forever preferred_lft forever
    var regex = /docker0.*inet\s(.*?)\//;
    var cmd   = "/sbin/ip -o addr show";

    return nfcall(lazy.exec, cmd)
      .spread((stdout) => {
        var match = stdout.match(regex);
        if (match) { return match[1]; }
        throw new Error('Get ip from docker0 interface');
      });
  }

  _loadDnsServers() {
    var cf_key = 'agent:dns:global';
    var nameservers = envDefaultArray('AZK_DNS_SERVERS', net.filterDnsServers(config(cf_key)));

    var obj = {};
    obj[cf_key] = nameservers;
    return obj;
  }
}
