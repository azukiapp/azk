"use strict";
var __moduleName = "src/agent/configure";
var $__2 = require('azk'),
    _ = $__2._,
    os = $__2.os,
    Q = $__2.Q,
    async = $__2.async;
var $__2 = require('azk'),
    config = $__2.config,
    set_config = $__2.set_config;
var UIProxy = require('azk/cli/ui').UIProxy;
var $__2 = require('azk/utils/errors'),
    OSNotSupported = $__2.OSNotSupported,
    DependencyError = $__2.DependencyError;
var isIPv4 = require('net').isIPv4;
var which = require('which');
var qfs = require('q-io/fs');
var Configure = function Configure(user_interface) {
  $traceurRuntime.superCall(this, $Configure.prototype, "constructor", [user_interface]);
  this.dns_separator = ':';
};
var $Configure = Configure;
($traceurRuntime.createClass)(Configure, {
  run: function() {
    var method = this[os.platform()];
    if (method) {
      return method.apply(this);
    } else {
      throw new OSNotSupported(os.platform());
    }
  },
  darwin: function() {
    this.dns_separator = '.';
    return Q.all([this._which('VBoxManage'), this._which('unfsd'), this._checkAndConfigureNetwork()]);
  },
  _which: function(command) {
    return Q.nfcall(which, command).fail((function() {
      throw new DependencyError(command);
    }));
  },
  _checkAndConfigureNetwork: function() {
    return async(this, function() {
      var file,
          exist,
          ip,
          port,
          cmd;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              file = config('agent:balancer:file_dns');
              $ctx.state = 21;
              break;
            case 21:
              $ctx.state = 2;
              return qfs.exists(file);
            case 2:
              exist = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (!exist) ? 15 : -2;
              break;
            case 15:
              this.warning('configure.vm_ip_msg');
              $ctx.state = 16;
              break;
            case 16:
              $ctx.state = 6;
              return this._getNetworkIp();
            case 6:
              ip = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              port = config('agent:dns:port');
              this.info('configure.adding_ip', {
                ip: ip,
                file: file
              });
              ip = ("" + ip + this.dns_separator + port);
              cmd = ("\n          echo \"\";\n          set -x;\n          sudo mkdir -p /etc/resolver 2>/dev/null;\n          echo \"# azk agent configure\" | sudo tee " + file + ";\n          echo \"nameserver " + ip + "\" | sudo tee -a " + file + ";\n          sudo chown \$(id -u):\$(id -g) " + file + ";\n          set +x;\n          echo \"\";\n        ");
              $ctx.state = 18;
              break;
            case 18:
              $ctx.state = 10;
              return this.execSh(cmd).fail((function(err) {
                throw new DependencyError('network');
              }));
            case 10:
              $ctx.maybeThrow();
              $ctx.state = 12;
              break;
            case 12:
              $ctx.returnValue = ip;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  _getNetworkIp: function() {
    var $__0 = this;
    var question = {
      name: 'ip',
      message: 'configure.ip_question',
      default: config('agent:vm:ip'),
      validate: (function(value) {
        var data = {ip: value};
        var of_range = $__0.t('configure.ip_of_range', data);
        var ip_invalid = $__0.t('configure.ip_invalid', data);
        var ranges = ['127.0.0.1', '0.0.0.0'];
        if (!isIPv4(value)) {
          return ip_invalid;
        }
        if (_.contains(ranges, value)) {
          return of_range;
        }
        return true;
      })
    };
    return this.prompt(question).then((function(answers) {
      return answers.ip;
    }));
  }
}, {}, UIProxy);
module.exports = {
  get Configure() {
    return Configure;
  },
  __esModule: true
};
//# sourceMappingURL=configure.js.map