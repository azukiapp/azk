"use strict";
var __moduleName = "src/utils/net";
var $__1 = require('azk'),
    Q = $__1.Q,
    _ = $__1._,
    defer = $__1.defer,
    config = $__1.config;
var nativeNet = require('net');
var dns = require('dns');
var portrange = config("agent:portrange_start");
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
  waitService: function(host, port) {
    var retry = arguments[2] !== (void 0) ? arguments[2] : 15;
    var opts = arguments[3] !== (void 0) ? arguments[3] : {};
    opts = _.merge({timeout: 10000}, opts);
    return defer((function(resolve, reject, notify) {
      var client = null;
      var attempts = 1,
          max = retry;
      var connect = (function() {
        notify({
          type: 'try_connect',
          attempts: attempts,
          max: max,
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
          if (attempts > max)
            return resolve(false);
          attempts += 1;
          connect();
        }), opts.timeout);
        client.on('error', (function(error) {}));
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