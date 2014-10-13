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
      return method.apply(this);
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
      this._which('unfsd'),
      this._checkAndConfigureNetwork(),
    ]);
  }

  // Linux configure and checks
  //linux() {
  //}

  _which(command) {
    return Q
      .nfcall(which, command)
      .fail(() => {
        throw new DependencyError(command);
      });
  }

  _checkAndConfigureNetwork() {
    return async(this, function* () {
      var file  = config('agent:balancer:file_dns');
      var exist = yield qfs.exists(file);
      if (!exist) {
        this.warning('configure.vm_ip_msg');
        var ip   = yield this._getNetworkIp();
        var port = config('agent:dns:port');

        // Creating resolver file and adding ip (with sudo)
        this.info('configure.adding_ip', { ip, file });
        ip = `${ip}${this.dns_separator}${port}`;
        var cmd = `
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
        yield this.execSh(cmd).fail((err) => {
          throw new DependencyError('network');
        });

        return ip;
      }
    });
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
