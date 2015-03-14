import { Q, _, defer, fs } from 'azk';
import { config, set_config } from 'azk';
import { envDefaultArray, isBlank } from 'azk/utils';

var portscanner = require('portscanner');
var url         = require('url');
var nativeNet   = require('net');

var { isIPv4 }  = require('net');

var portrange = config("agent:portrange_start");
var cache_key = "agent:dns:file_cache";

var net = {
  getPort(host = 'localhost') {
    var port   = portrange;
    portrange += 1;

    return this
      .checkPort(port, host)
      .then((avaibly) => {
        return (avaibly) ? port : this.getPort(host);
      });
  },

  checkPort(port, host = 'localhost') {
    return Q.ninvoke(portscanner, "checkPortStatus", port, host)
      .then((status) => {
        return status == 'closed';
      });
  },

  calculateNetIp(ip) {
    return ip.replace(/^(.*)\..*$/, "$1.0/24");
  },

  calculateGatewayIp(ip) {
    return ip.replace(/^(.*)\..*$/, "$1.1");
  },

  nameServers(custom_dns_servers, options={}) {
    var dns_servers;
    var nameservers     = config(cache_key);
    var env_dns_servers = envDefaultArray('AZK_DNS_SERVERS', []);

    if (custom_dns_servers && !_.isArray(custom_dns_servers)) {
      options = custom_dns_servers || {};
      custom_dns_servers = null;
    }

    if (!_.isEmpty(env_dns_servers)) {
      // env AZK_DNS_SERVERS
      dns_servers = env_dns_servers;
    } else if (custom_dns_servers) {
      // custom_dns_servers (i.g. from Azkfile.js)
      dns_servers = custom_dns_servers;
    } else if (isBlank(nameservers)) {
      var resolv = this._readResolverFile(options.resolv_path);
      dns_servers = this.filterDnsServers(resolv);

      if (_.isEmpty(dns_servers)) {
        dns_servers = config('agent:dns:defaultserver');
      }
    } else {
      dns_servers = nameservers;
    }

    if (!_.contains(dns_servers, config("agent:dns:ip"))) {
      dns_servers.unshift(config("agent:dns:ip"));
    }

    if (!custom_dns_servers) {
      set_config(cache_key, dns_servers);
    }

    return dns_servers;
  },

  filterDnsServers(nameservers) {
    return _.filter(nameservers, (server) => { return !server.match(/^127\./); });
  },

  _readResolverFile(file = "/etc/resolv.conf") {
    var data;
    if (file) {
      data = fs.readFileSync(file).toString();
      data = this.parseNameserver(data);
    }
    return data ? data : [];
  },

  parseNameserver(content) {
    var lines   = content.split('\n');
    var regex   = /^\s*nameserver\s{1,}((?:[0-9]{1,3}\.){3}[0-9]{1,3})/;
    var capture = null;
    return _.reduce(lines, (nameservers, line) => {
      if ((capture = line.match(regex))) {
        var ip = capture[1];
        if (isIPv4(ip)) {
          nameservers.push(ip);
        }
      }
      return nameservers;
    }, []);
  },

  waitService(uri, retry = 15, opts = {}) {
    opts = _.defaults(opts, {
      timeout: 10000,
      retry_if: () => { return Q(true); }
    });

    // Parse options to try connect
    var address = url.parse(uri);
    if (address.protocol == 'unix:') {
      address = { path: address.path };
    } else {
      address = {
        host: address.hostname,
        port: address.port,
      };
    }

    return defer((resolve, reject, notify) => {
      var client   = null;
      var attempts = 1, max = retry;
      var connect  = () => {
        var t = null;
        notify(_.merge({
          uri : uri,
          type: 'try_connect', attempts: attempts, max: max, context: opts.context
        }, address ));

        client = nativeNet.connect(address, function() {
          client.end();
          clearTimeout(t);
          resolve(true);
        });

        t = setTimeout(() => {
          client.end();

          opts.retry_if().then((result) => {
            if (attempts >= max || !result) {
              return resolve(false);
            }
            attempts += 1;
            connect();
          }, () => resolve(false));
        }, opts.timeout);

        // Ignore connect error
        client.on('error', () => { return false; });
      };
      connect();
    });
  },

  // TODO: change for a generic service wait function
  waitForwardingService(host, port, retry = 15, timeout = 10000) {
    return defer((resolve, reject, notify) => {
      var client   = null;
      var attempts = 1, max = retry;
      var connect  = () => {
        notify({ type: 'try_connect', attempts: attempts, max: max });

        var timeout_func = function() {
          attempts += 1;
          connect();
        };

        client = nativeNet.connect({ host, port}, function() {
          client.on('data', function() {
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
          if (error.code == 'ECONNREFUSED' && attempts <= max) {
            setTimeout(timeout_func, timeout);
          } else {
            reject(error);
          }
        });
      };

      connect();
    });
  },
};

export default net;
