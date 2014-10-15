import { _, os, Q, async } from 'azk';
import { config, set_config } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { OSNotSupported, DependencyError } from 'azk/utils/errors';
import { isIPv4 } from 'net';

var which = require('which');   // Search for command in path
var qfs   = require('q-io/fs');

export class Configure extends UIProxy {
  constructor(user_interface) {
    super(user_interface);
    this.dns_separator = ':';
  }

  // Run configures and checks by operational system
  run() {
    var method = this[os.platform()];
    if (method) {
      return method.apply(this)
        .then((confgs) => {
          return _.reduce(confgs, (acc, lines) => {
            if (!_.isEmpty(lines)) {
              _.each(lines, (line, key) => acc[key] = line);
            }
            return acc;
          }, {});
        });
    } else {
      throw new OSNotSupported(os.platform());
    }
  }

  // Mac OS X configure and checks
  // TODO: Check dependencies versions
  darwin() {
    this.dns_separator = '.';
    return Q.all([
      this._which('VBoxManage'),
      this._which('unfsd', 'paths:unfsd'),
      this._checkAndConfigureNetwork(),
      this._checkAndGenerateSSHKeys(),
    ]);
  }

  // Linux configure and checks
  //linux() {
  //}

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
  _checkAndConfigureNetwork() {
    return async(this, function* () {
      var file  = config('agent:balancer:file_dns');
      var exist = yield qfs.exists(file);
      var ip    = null;

      // File exist? Get content
      if (exist) {
        var content = yield qfs.read(file);
        ip = this._parseNameserver(content)[0];
      }

      // Not exist or invalid content
      if (_.isEmpty(ip)) {
        this.warning('configure.vm_ip_msg');
        ip = yield this._getNetworkIp();
        yield this._generateResolverFile(ip, file);
      }

      // Save configuration
      return {
        ['agent:vm:ip']      : ip,
        ['agent:dns:ip']     : ip,
        ['agent:balancer:ip']: ip,
        ['docker:host']      : `http://${ip}:2375`,
      };
    });
  }

  // Generate file /etc/resolver/*
  _generateResolverFile(ip, file) {
    var port = config('agent:dns:port');

    // Creating resolver file and adding ip (with sudo)
    this.info('configure.adding_ip', { ip, file });
    ip = `${ip}${this.dns_separator}${port}`;
    var script = `
      echo "";
      set -x;
      sudo mkdir -p /etc/resolver 2>/dev/null;
      echo "# azk agent configure" | sudo tee ${file};
      echo "nameserver ${ip}" | sudo tee -a ${file};
      sudo chown \$(id -u):\$(id -g) ${file};
      set +x;
      echo "";
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
    var regex   = /nameserver ((?:[0-9]{1,3}\.){3}[0-9]{1,3})/;
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
}
