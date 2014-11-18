import { _, t, os, Q, async, log, lazy_require } from 'azk';
import { config, set_config } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { OSNotSupported, DependencyError } from 'azk/utils/errors';
import { net } from 'azk/utils';
import Azk from 'azk';

var which      = require('which');   // Search for command in path
var qfs        = require('q-io/fs');
var request    = require('request');
var semver     = require('semver');
var { isIPv4 } = require('net');

lazy_require(this, {
  docker  : ['azk/docker', 'default'],
  exec    : ['child_process'],
  isOnline: 'is-online',
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
        return _.merge(
          {},
          yield this._checkAzkVersion(),
          yield this._checkDockerSocket(socket),
          yield this._checkAndConfigureNetwork(false),
          yield this._loadDnsServers(),
          yield this._cleanContainers(),
          yield this._checkPorts('agent:balancer:port', 'balancer', 'AZK_BALANCER_PORT'),
          yield this._checkPorts('agent:dns:port', 'dns', 'AZK_DNS_PORT')
        );
      })
      .fail((err) => {
        if (!(err instanceof DependencyError))
          err = new DependencyError('docker_access', { socket });
        throw err;
      });
    }
  }

  _checksForRequiresVm() {
    return async(this, function* () {
      return _.merge(
        {},
        yield this._checkAzkVersion(),
        yield this._which('VBoxManage'),
        yield this._which('unfsd', 'paths:unfsd'),
        yield this._checkAndConfigureNetwork(),
        yield this._checkAndGenerateSSHKeys(),
        yield this._loadDnsServers()
      );
    });
  }

  _checkAzkVersion() {
    return async(this, function* (notify) {
      try {
        // check connectivity
        var currentOnline = yield Q.ninvoke(isOnline);

        if ( !currentOnline ) {
          log.debug('isOnline == false');
          return {}; //can't check version
        }

        // get AZK version from Github API
        var options = {
          headers: { 'User-Agent': 'request' },
          json: true,
        }

        notify({ type: "status", keys: "configure.check_version"});
        var [response, body] = yield Q.ninvoke(request, 'get', config('urls:github:api:tags_url'), options);

        var tagNameGithub = body[0].name;
        var tagNameGithubParsed = semver.clean(tagNameGithub);
        var newAzkVersionExists = semver.lt(Azk.version, tagNameGithubParsed);
        if ( newAzkVersionExists ) {
          // just warn user that new AZK version is available
          this.warning('errors.dependencies.*.upgrade', {
            current_version: Azk.version,
            new_version: tagNameGithubParsed
          });
        } else {
          log.debug('AZK version `v'+ tagNameGithubParsed +'` is up to date.');
        }
      } catch (err) {
        notify({
          type: "status",
          status: "error",
          data: new Error(t("configure.check_version_error", {
            error_message: err.message
          })),
        });
      }

      return {};
    });
  }

  _cleanContainers() {
    return docker
      .azkListContainers()
      .then((containers) => {
        this.warning('configure.clean_containers', { count: containers.length });
        var removes = _.map(containers, (container) => {
          return docker
            .getContainer(container.Id)
            .remove({ force: true });
        });
        return Q
          .all(removes)
          .then(() => { return {} });
      });
  }

  _checkDockerSocket(socket) {
    var host = `unix://${socket}`;
    set_config('docker:host', host);

    return docker
      .info()
      .then((info) => {
        return { 'docker:host': host };
      });
  }

  _checkPorts(confKey, service, env) {
    var port = config(confKey);
    return net
      .checkPort(port, this.docker_ip)
      .then((avaibly) => {
        if (!avaibly)
          throw new DependencyError('port_error', { port, service, env });
      });
  }

  _which(command, save_key = null) {
    return Q.nfcall(which, command)
      .then((path) => {
        if (save_key) return { [save_key]: path };
      })
      .fail(() => {
        throw new DependencyError(command);
      });
  }

  // Check for ssh keys, used for connection vm
  _checkAndGenerateSSHKeys() {
    var file = config('agent:vm:ssh_key');
    return qfs.exists(file).then((exist) => {
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
          if (code != 0) {
            throw new DependencyError('ssh_keygen');
          } else {
            return code;
          }
        });
      }
    });
  }

  // Check vm ip is configurat
  _checkAndConfigureNetwork(use_vm = true) {
    return async(this, function* () {
      var file   = config('agent:balancer:file_dns');
      var exist  = yield qfs.exists(file);
      var ip     = null;
      var result = {};

      // File exist? Get content
      if (exist) {
        var content = yield qfs.read(file);
        ip = this._parseNameserver(content)[0];
      }

      // Not exist or invalid content
      if (_.isEmpty(ip)) {
        if (use_vm) {
          this.warning('configure.vm_ip_msg');
          ip = yield this._getNetworkIp();
        } else {
          ip = yield this._getDockerIp();
        }
        yield this._generateResolverFile(ip, file);
      }

      if (use_vm) {
        result['docker:host'] = `http://${ip}:2375`;
      }

      // Save to use in configure
      this.docker_ip = ip;

      // Save configuration
      return _.merge({
        ['agent:vm:ip']      : ip,
        ['agent:dns:ip']     : ip,
        ['agent:balancer:ip']: ip,
      }, result);
    });
  }

  // Generate file /etc/resolver/*
  _generateResolverFile(ip, file) {
    var port = config('agent:dns:port');

    // Creating resolver file and adding ip (with sudo)
    this.info('configure.adding_ip', { ip, file });
    ip = `${ip}${this.dns_tab}${port}`;
    var script = `
      echo "" &&
      set -x &&
      sudo mkdir -p /etc/resolver 2>/dev/null &&
      echo "# azk agent configure" | sudo tee ${file} &&
      echo "nameserver ${ip}" | sudo tee -a ${file} &&
      sudo chown \$(id -u):\$(id -g) ${file} &&
      set +x &&
      echo ""
    `;

    // Call interactive shell (to support sudo)
    return this.execSh(script).then((code) => {
      if (code != 0) {
        throw new DependencyError('network');
      } else {
        return code;
      }
    });
  }

  _parseNameserver(content) {
    var lines   = content.split('\n');
    var regex   = /^\s*nameserver\s{1,}((?:[0-9]{1,3}\.){3}[0-9]{1,3})/;
    var capture = null;
    return _.reduce(lines, (nameservers, line) => {
      if (capture = line.match(regex)) {
        var ip = capture[1];
        if (isIPv4(ip)) nameservers.push(ip);
      }
      return nameservers;
    }, []);
  }

  // TODO: improve to get a free network ip ranges
  // TODO: filter others /etc/resolver/* azk files
  _getNetworkIp() {
    var question = {
      name    : 'ip',
      message : 'configure.ip_question',
      default : config('agent:vm:ip'),
      validate: (value) => {
        var data       = { ip: value };
        var of_range   = this.t('configure.ip_of_range', data);
        var ip_invalid = this.t('configure.ip_invalid', data);
        var ranges     = [ '127.0.0.1', '0.0.0.0' ];

        // Check is valid ip
        if (!isIPv4(value)) { return ip_invalid; }
        if (_.contains(ranges, value)) { return of_range; }

        return true;
      }
    };

    return this.prompt(question)
      .then((answers) => {
        return answers.ip;
      });
  }

  _getDockerIp() {
    // 2: docker0    inet 10.0.42.1/16 scope global docker0\       valid_lft forever preferred_lft forever
    var regex = /docker0.*inet\s(.*?)\//;
    var cmd   = "/sbin/ip -o addr show";

    return Q.nfcall(exec, cmd)
      .spread((stdout) => {
        var match = stdout.match(regex);
        if (match) { return match[1]; }
        throw new Error('Get ip from docker0 interface');
      });
  }

  _loadDnsServers() {
    return async(this, function* () {
      var cf_key = 'agent:dns:nameservers';
      var nameservers = this._filderDnsServers(config(cf_key));

      if (_.isEmpty(nameservers)) {
        nameservers = this._filderDnsServers(yield this._readResolverFile());
      }

      if (_.isEmpty(nameservers)) {
        nameservers = config('agent:dns:defaultserver');
      }

      return { [cf_key]: nameservers };
    });
  }

  _filderDnsServers(nameservers) {
    return _.filter(nameservers, (server) => { return !server.match(/^127\./) });
  }

  _readResolverFile() {
    var file = "/etc/resolv.conf";
    return qfs.read(file).then(this._parseNameserver);
  }
}
