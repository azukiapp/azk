"use strict";
var __moduleName = "src/utils/net";
var $__1 = require('azk'),
    Q = $__1.Q,
    _ = $__1._,
    fs = $__1.fs,
    defer = $__1.defer,
    config = $__1.config;
var url = require('url');
var nativeNet = require('net');
var portrange = config("agent:portrange_start");
var nameservers = null;
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
    if (nameservers == null) {
      nameservers = [config("agent:dns:ip")];
      var file = "/etc/resolv.conf";
      if (fs.existsSync(file)) {
        var lines = fs.readFileSync(file).toString().split("\n");
        _.each(lines, (function(line) {
          if (line.match(/^nameserver.*$/)) {
            nameservers.push(line.replace(/^nameserver\s{1,}(.*)/, "$1"));
          }
        }));
      }
    }
    return nameservers;
  },
  waitService: function(address) {
    var retry = arguments[1] !== (void 0) ? arguments[1] : 15;
    var opts = arguments[2] !== (void 0) ? arguments[2] : {};
    opts = _.defaults(opts, {
      timeout: 10000,
      retry_if: (function() {
        return Q(true);
      })
    });
    address = url.parse(address);
    address = {
      host: address.hostname,
      port: address.port,
      path: address.protocol == "unix:" ? address.path : null
    };
    return defer((function(resolve, reject, notify) {
      var client = null;
      var attempts = 1,
          max = retry;
      var connect = (function() {
        var t = null;
        notify(_.merge({
          type: 'try_connect',
          attempts: attempts,
          max: max,
          context: opts.context
        }, address));
        client = nativeNet.connect(address, function() {
          client.end();
          clearTimeout(t);
          resolve(true);
        });
        t = setTimeout((function() {
          client.end();
          opts.retry_if().then((function(result) {
            if (attempts >= max || !result)
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