import { Q, _, fs, defer, config } from 'azk';

var nativeNet   = require('net');
var portrange   = config("agent:portrange_start");
var nameservers = [];

var net = {
  getPort() {
    var port   = portrange;
    portrange += 1;
    var server = nativeNet.createServer();

    return defer((done) => {
      server.listen(port, (err) => {
        server.once('close', () => {
          done.resolve(port);
        });
        server.close();
      });
      server.on('error', (err) => {
        done.resolve(this.getPort());
      });
    });
  },

  calculateNetIp(ip) {
    return ip.replace(/^(.*)\..*$/, "$1.0/24");
  },

  calculateGatewayIp(ip) {
    return ip.replace(/^(.*)\..*$/, "$1.1");
  },

  nameServers() {
    if (_.isEmpty(nameservers)) {
      var lines = fs.readFileSync("/etc/resolv.conf").toString().split("\n");
      _.each(lines, (line) => {
        if (line.match(/^nameserver.*$/)) {
          nameservers.push(line.replace(/^nameserver\s{1,}(.*)/, "$1"));
        }
      });
      nameservers.unshift(config("agent:dns:ip"));
    }
    return nameservers;
  },

  waitService(host, port, retry = 15, opts = {}) {
    opts = _.defaults(opts, {
      timeout: 10000,
      retry_if: () => { return Q(true); }
    });

    return defer((resolve, reject, notify) => {
      var client   = null;
      var attempts = 1, max = retry;
      var connect  = () => {
        notify({ type: 'try_connect', attempts, max, host, port, context: opts.context });
        var t = null;

        client = nativeNet.connect({ host, port}, function() {
          client.end();
          clearTimeout(t);
          resolve(true);
        });

        t = setTimeout(() => {
          client.end();

          opts.retry_if().then((result) => {
            if (attempts > max || !result) return resolve(false);
            attempts += 1;
            connect();
          }, () => resolve(false));
        }, opts.timeout);

        // Ignore connect error
        client.on('error', (error) => { return false; });
      }
      connect();
    });
  },

  // TODO: change for a generic service wait function
  waitForwardingService(host, port, retry = 15, timeout = 10000) {
    return defer((resolve, reject, notify) => {
      var client   = null;
      var attempts = 1, max = retry;
      var connect  = () => {
        notify({ type: 'try_connect', attempts, max });

        var timeout_func = function() {
          attempts += 1;
          connect();
        }

        client = nativeNet.connect({ host, port}, function() {
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

        client.on('error', (error) => {
          if(error.code == 'ECONNREFUSED' && attempts <= max) {
            setTimeout(timeout_func, timeout);
          } else {
            reject(error)
          }
        });
      }

      connect();
    });
  },
}

export default net;
