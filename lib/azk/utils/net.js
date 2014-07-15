"use strict";
var __moduleName = "src/utils/net";
var $__1 = require('azk'),
    Q = $__1.Q,
    _ = $__1._,
    fs = $__1.fs,
    defer = $__1.defer,
    config = $__1.config;
var nativeNet = require('net');
var portrange = config("agent:portrange_start");
var nameservers = [];
var net = {
  getPort: function() {
    var $__0 = this;
    var port = portrange;
    portrange += 1;
    var server = nativeNet.createServer();
    return defer((function(done) {
      server.listen(port, (function(err) {
        server.once('close', (function() {
          done.resolve(port);
        }));
        server.close();
      }));
      server.on('error', (function(err) {
        done.resolve($__0.getPort());
      }));
    }));
  },
  calculateNetIp: function(ip) {
    return ip.replace(/^(.*)\..*$/, "$1.0/24");
  },
  calculateGatewayIp: function(ip) {
    return ip.replace(/^(.*)\..*$/, "$1.1");
  },
  nameServers: function() {
    if (_.isEmpty(nameservers)) {
      var lines = fs.readFileSync("/etc/resolv.conf").toString().split("\n");
      _.each(lines, (function(line) {
        if (line.match(/^nameserver.*$/)) {
          nameservers.push(line.replace(/^nameserver\s{1,}(.*)/, "$1"));
        }
      }));
      nameservers.unshift(config("agent:dns:ip"));
    }
    return nameservers;
  },
  waitService: function(host, port) {
    var retry = arguments[2] !== (void 0) ? arguments[2] : 15;
    var opts = arguments[3] !== (void 0) ? arguments[3] : {};
    opts = _.defaults(opts, {
      timeout: 10000,
      retry_if: (function() {
        return Q(true);
      })
    });
    return defer((function(resolve, reject, notify) {
      var client = null;
      var attempts = 1,
          max = retry;
      var connect = (function() {
        notify({
          type: 'try_connect',
          attempts: attempts,
          max: max,
          host: host,
          port: port,
          context: opts.context
        });
        var t = null;
        client = nativeNet.connect({
          host: host,
          port: port
        }, function() {
          client.end();
          clearTimeout(t);
          resolve(true);
        });
        t = setTimeout((function() {
          client.end();
          opts.retry_if().then((function(result) {
            if (attempts > max || !result)
              return resolve(false);
            attempts += 1;
            connect();
          }), (function() {
            return resolve(false);
          }));
        }), opts.timeout);
        client.on('error', (function(error) {
          return false;
        }));
      });
      connect();
    }));
  },
  waitForwardingService: function(host, port) {
    var retry = arguments[2] !== (void 0) ? arguments[2] : 15;
    var timeout = arguments[3] !== (void 0) ? arguments[3] : 10000;
    return defer((function(resolve, reject, notify) {
      var client = null;
      var attempts = 1,
          max = retry;
      var connect = (function() {
        notify({
          type: 'try_connect',
          attempts: attempts,
          max: max
        });
        var timeout_func = function() {
          attempts += 1;
          connect();
        };
        client = nativeNet.connect({
          host: host,
          port: port
        }, function() {
          client.on('data', function(data) {
            client.destroy();
            resolve();
          });
          if (attempts <= max) {
            client.setTimeout(timeout, timeout_func);
          } else {
            client.destroy();
            reject();
          }
        });
        client.on('error', (function(error) {
          if (error.code == 'ECONNREFUSED' && attempts <= max) {
            setTimeout(timeout_func, timeout);
          } else {
            reject(error);
          }
        }));
      });
      connect();
    }));
  }
};
var $__default = net;
module.exports = {
  get default() {
    return $__default;
  },
  __esModule: true
};
//# sourceMappingURL=net.js.map