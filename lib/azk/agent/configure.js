module.exports = function() {
  "use strict";
  var $__2;
  var __moduleName = "src/agent/configure";
  var $__3 = require('azk'),
      _ = $__3._,
      os = $__3.os,
      Q = $__3.Q,
      async = $__3.async,
      dynamic = $__3.dynamic;
  var $__3 = require('azk'),
      config = $__3.config,
      set_config = $__3.set_config;
  var UIProxy = require('azk/cli/ui').UIProxy;
  var $__3 = require('azk/utils/errors'),
      OSNotSupported = $__3.OSNotSupported,
      DependencyError = $__3.DependencyError;
  var isIPv4 = require('net').isIPv4;
  var which = require('which');
  var qfs = require('q-io/fs');
  dynamic(this, {
    docker: function() {
      return require('azk/docker').default;
    },
    exec: function() {
      return require('child_process').exec;
    }
  });
  var ports_tabs = {
    linux: ":",
    darwin: "."
  };
  var Configure = function Configure(user_interface) {
    $traceurRuntime.superCall(this, $Configure.prototype, "constructor", [user_interface]);
    this.dns_tab = ports_tabs[os.platform()];
  };
  var $Configure = Configure;
  ($traceurRuntime.createClass)(Configure, ($__2 = {}, Object.defineProperty($__2, "run", {
    value: function() {
      var method = this[os.platform()];
      if (method) {
        return method.apply(this).then((function(confgs) {
          return _.reduce(confgs, (function(acc, lines) {
            if (!_.isEmpty(lines)) {
              _.each(lines, (function(line, key) {
                return acc[key] = line;
              }));
            }
            return acc;
          }), {});
        }));
      } else {
        throw new OSNotSupported(os.platform());
      }
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, "darwin", {
    value: function() {
      return this._checksForRequiresVm();
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, "linux", {
    value: function() {
      if (config('agent:requires_vm')) {
        return this._checksForRequiresVm();
      } else {
        var socket = config('docker:socket');
        return Q.all([this._checkDockerSocket(socket), this._checkAndConfigureNetwork(false)]).fail((function(err) {
          throw new DependencyError('docker_access', {socket: socket});
        }));
      }
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, "_checksForRequiresVm", {
    value: function() {
      return Q.all([this._which('VBoxManage'), this._which('unfsd', 'paths:unfsd'), this._checkAndConfigureNetwork(), this._checkAndGenerateSSHKeys(), this._loadDnsServers()]);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, "_checkDockerSocket", {
    value: function(socket) {
      var host = ("unix://" + socket);
      set_config('docker:host', host);
      return docker.info().then((function(info) {
        return {'docker:host': host};
      }));
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, "_which", {
    value: function(command) {
      var save_key = arguments[1] !== (void 0) ? arguments[1] : null;
      return Q.nfcall(which, command).then((function(path) {
        var $__2;
        if (save_key)
          return ($__2 = {}, Object.defineProperty($__2, save_key, {
            value: path,
            configurable: true,
            enumerable: true,
            writable: true
          }), $__2);
      })).fail((function() {
        throw new DependencyError(command);
      }));
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, "_checkAndGenerateSSHKeys", {
    value: function() {
      var $__0 = this;
      var file = config('agent:vm:ssh_key');
      return qfs.exists(file).then((function(exist) {
        if (!exist) {
          $__0.info('configure.generating_key');
          var script = ("\n          set -x;\n          ssh-keygen -t rsa -f " + file + " -N ''; result=$?;\n          set +x;\n          echo \"\";\n          exit $result;\n        ");
          return $__0.execSh(script).then((function(code) {
            if (code != 0) {
              throw new DependencyError('ssh_keygen');
            } else {
              return code;
            }
          }));
        }
      }));
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, "_checkAndConfigureNetwork", {
    value: function() {
      var use_vm = arguments[0] !== (void 0) ? arguments[0] : true;
      return async(this, function() {
        var $__2,
            file,
            exist,
            ip,
            result,
            content;
        return $traceurRuntime.generatorWrap(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                file = config('agent:balancer:file_dns');
                $ctx.state = 33;
                break;
              case 33:
                $ctx.state = 2;
                return qfs.exists(file);
              case 2:
                exist = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                ip = null;
                result = {};
                $ctx.state = 35;
                break;
              case 35:
                $ctx.state = (exist) ? 5 : 10;
                break;
              case 5:
                $ctx.state = 6;
                return qfs.read(file);
              case 6:
                content = $ctx.sent;
                $ctx.state = 8;
                break;
              case 8:
                ip = this._parseNameserver(content)[0];
                $ctx.state = 10;
                break;
              case 10:
                $ctx.state = (_.isEmpty(ip)) ? 24 : 28;
                break;
              case 24:
                $ctx.state = (use_vm) ? 16 : 20;
                break;
              case 16:
                this.warning('configure.vm_ip_msg');
                $ctx.state = 17;
                break;
              case 17:
                $ctx.state = 13;
                return this._getNetworkIp();
              case 13:
                ip = $ctx.sent;
                $ctx.state = 15;
                break;
              case 15:
                result['docker:host'] = ("http://" + ip + ":2375");
                $ctx.state = 19;
                break;
              case 20:
                $ctx.state = 21;
                return this._getDockerIp();
              case 21:
                ip = $ctx.sent;
                $ctx.state = 19;
                break;
              case 19:
                $ctx.state = 26;
                return this._generateResolverFile(ip, file);
              case 26:
                $ctx.maybeThrow();
                $ctx.state = 28;
                break;
              case 28:
                $ctx.returnValue = _.merge(($__2 = {}, Object.defineProperty($__2, 'agent:vm:ip', {
                  value: ip,
                  configurable: true,
                  enumerable: true,
                  writable: true
                }), Object.defineProperty($__2, 'agent:dns:ip', {
                  value: ip,
                  configurable: true,
                  enumerable: true,
                  writable: true
                }), Object.defineProperty($__2, 'agent:balancer:ip', {
                  value: ip,
                  configurable: true,
                  enumerable: true,
                  writable: true
                }), $__2), result);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, this);
      });
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, "_generateResolverFile", {
    value: function(ip, file) {
      var port = config('agent:dns:port');
      this.info('configure.adding_ip', {
        ip: ip,
        file: file
      });
      ip = ("" + ip + this.dns_tab + port);
      var script = ("\n      echo \"\";\n      set -x;\n      sudo mkdir -p /etc/resolver 2>/dev/null;\n      echo \"# azk agent configure\" | sudo tee " + file + ";\n      echo \"nameserver " + ip + "\" | sudo tee -a " + file + ";\n      sudo chown \$(id -u):\$(id -g) " + file + ";\n      set +x;\n      echo \"\";\n    ");
      return this.execSh(script).then((function(code) {
        if (code != 0) {
          throw new DependencyError('network');
        } else {
          return code;
        }
      }));
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, "_parseNameserver", {
    value: function(content) {
      var lines = content.split('\n');
      var regex = /^\s*nameserver\s{1,}((?:[0-9]{1,3}\.){3}[0-9]{1,3})/;
      var capture = null;
      return _.reduce(lines, (function(nameservers, line) {
        if (capture = line.match(regex)) {
          var ip = capture[1];
          if (isIPv4(ip))
            nameservers.push(ip);
        }
        return nameservers;
      }), []);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, "_getNetworkIp", {
    value: function() {
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
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, "_getDockerIp", {
    value: function() {
      var cmd = "/sbin/ifconfig docker0";
      var regex = /inet\s(?:addr:){0,1}(.*?)\s.*(?:Mask|netmask)/m;
      return Q.nfcall(exec, cmd).spread((function(stdout) {
        var match = stdout.match(regex);
        if (match) {
          return match[1];
        }
        throw new Error('Get ip from docker0 interface');
      }));
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, "_loadDnsServers", {
    value: function() {
      return async(this, function() {
        var $__2,
            cf_key,
            nameservers,
            $__4,
            $__5,
            $__6,
            $__7,
            $__8;
        return $traceurRuntime.generatorWrap(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                cf_key = 'agent:dns:nameservers';
                nameservers = this._filderDnsServers(config(cf_key));
                $ctx.state = 13;
                break;
              case 13:
                $ctx.state = (_.isEmpty(nameservers)) ? 5 : 8;
                break;
              case 5:
                $__4 = this._filderDnsServers;
                $__5 = this._readResolverFile;
                $__6 = $__5.call(this);
                $ctx.state = 6;
                break;
              case 6:
                $ctx.state = 2;
                return $__6;
              case 2:
                $__7 = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                $__8 = $__4.call(this, $__7);
                nameservers = $__8;
                $ctx.state = 8;
                break;
              case 8:
                if (_.isEmpty(nameservers)) {
                  nameservers = config('agent:dns:defaultserver');
                }
                $ctx.state = 15;
                break;
              case 15:
                $ctx.returnValue = ($__2 = {}, Object.defineProperty($__2, cf_key, {
                  value: nameservers,
                  configurable: true,
                  enumerable: true,
                  writable: true
                }), $__2);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, this);
      });
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, "_filderDnsServers", {
    value: function(nameservers) {
      return _.filter(nameservers, (function(server) {
        return !server.match(/^127\./);
      }));
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, "_readResolverFile", {
    value: function() {
      var file = "/etc/resolv.conf";
      return qfs.read(file).then(this._parseNameserver);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__2), {}, UIProxy);
  return {
    get Configure() {
      return Configure;
    },
    __esModule: true
  };
}.call(typeof global !== 'undefined' ? global : this);
//# sourceMappingURL=configure.js.map