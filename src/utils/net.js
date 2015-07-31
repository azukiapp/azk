import { _, fs, lazy_require, config, set_config } from 'azk';
import { publish } from 'azk/utils/postal';
import { async, defer, ninvoke, promiseResolve } from 'azk/utils/promises';
import { envDefaultArray, isBlank } from 'azk/utils';

var portscanner = require('portscanner');
var url         = require('url');
var nativeNet   = require('net');
var os          = require('os');

var { isIPv4 }  = require('net');

var lazy = lazy_require({
  Netmask        : ['netmask'],
  hostonly       : ['azk/agent/vm'],
  VM             : ['azk/agent/vm'],
  connectivity   : 'connectivity',
  nodeRetry      : 'retry',
});

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
    return ninvoke(portscanner, "checkPortStatus", port, host)
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
    var data = null;
    if (file) {
      try {
        var content = fs.readFileSync(file).toString();
        data = this.parseNameserver(content);
        data = _.map(data, (nameserver) => nameserver.ip);
      } catch (err) { }
    }
    return data ? data : [];
  },

  // Regex: https://regex101.com/r/qK0aS1/1
  parseNameserver(content) {
    var lines   = content.split('\n');
    var regex   = /^\s*nameserver\s{1,}((?:\d{1,3}\.){3}\d{1,3})(?:[:|\.]?(\d{1,5}))?$/;
    var capture = null;
    return _.reduce(lines, (acc, line) => {
      if ((capture = line.match(regex))) {
        var ip   = capture[1];
        var port = capture[2] || "53";
        if (isIPv4(ip)) {
          acc.push({ ip, port });
        }
      }
      return acc;
    }, []);
  },

  // TODO: improve to get a free network ip ranges
  generateSuggestionIp(ip, interfaces, info = () => {}) {
    if (_.isEmpty(this._suggestion_ips)) {
      var ranges = _.range(50, 255).concat(_.range(10, 50 ), _.range(0 , 10 ));
      this._suggestion_ips = _.map(ranges, (i) => `192.168.${i}.4`);
    }
    info("configure.find_suggestions_ips");
    return _.find(this._suggestion_ips, (new_ip) => {
      if (new_ip != ip) {
        var conflict = this.conflictInterface(new_ip, interfaces);
        if (_.isEmpty(conflict)) { return true; }
        var info_data = { ip: new_ip, inter_name: conflict.name, inter_ip: conflict.ip };
        info("configure.errors.ip_conflict", info_data);
      }
    });
  },

  conflictInterface(ip, interfaces) {
    if (_.isEmpty(ip)) { return null; }
    var block = new lazy.Netmask(net.calculateNetIp(ip));
    return _.find(interfaces, (network) => {
      return block.contains(network.ip);
    });
  },

  getInterfacesIps(vm_name) {
    return async(this, function* () {
      var hostonly_interface = vm_name ? yield this._getVMHostonlyInterface(vm_name) : null;
      // System interfaces
      var system_interfaces = _.reduce(os.networkInterfaces(), (acc, ips, name) => {
        if (name != hostonly_interface) {
          var ip = _.find(ips, (ip) => {
            return ip.family == 'IPv4';
          });
          if (ip) { acc.push({ name: name, ip: ip.address }); }
        }
        return acc;
      }, []);

      // VirtualBox interfaces
      var vbox_interfaces = _.reduce(yield lazy.hostonly.list(), (acc, inter) => {
        var ip = inter.IPAddress;
        if (inter.Name != hostonly_interface) {
          acc.push({ name: inter.Name, ip });
        }
        return acc;
      }, []);

      return system_interfaces.concat(vbox_interfaces);
    });
  },

  _getVMHostonlyInterface(vm_name) {
    return lazy.VM.info(vm_name).then((info) => {
      if (info.installed) {
        return info.hostonlyadapter1;
      }
      return null;
    });
  },

  waitService(uri, opts = {}) {
    opts = _.defaults(opts, {
      timeout: 10000,      // maximum timeout - this may be override
      retry_if: () => { return promiseResolve(true); },
      publish_retry: true,
      nodeRetry_opts: {
        retries: 100,      // maximum tries
        factor: 1.2,
        minTimeout: 75,    // min delay
        maxTimeout: 5000,  // max delay
        randomize: true,
      }
    });

    var timeoutsArray = lazy.nodeRetry.timeouts(opts.nodeRetry_opts);

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

    var client = null, t = null;
    var end = () => {
      if (client) { client.end(); }
      if (t) { clearTimeout(t); }
      client = t = null;
    };

    return defer((resolve) => {
      var attempts = 1, max = opts.nodeRetry_opts.retries;
      var connect  = () => {
        if (opts.publish_retry) {
          publish("utils.net.waitService.status", _.merge({
            uri : uri,
            type: 'try_connect',
            timeout: (opts.timeout / 1000), // show in seconds
            attempts: attempts,
            max: max,
            context: opts.context
          }, address ));
        }

        client = nativeNet.connect(address, function() {
          end();
          resolve(true);
        });

        t = setTimeout(() => {
          end();
          opts.retry_if().then((result) => {
            if (attempts >= max || !result) {
              return resolve(false);
            }
            attempts += 1;
            connect();
          }, () => resolve(false));
        }, timeoutsArray[attempts - 1]);

        // Ignore connect error
        client.on('error', () => { return false; });
      };
      connect();
    })
    .timeout(opts.timeout)
    .catch(function () {
      end();
      return promiseResolve(false);
    });
  },

  // TODO: change for a generic service wait function
  waitForwardingService(host, port, retry = 15, timeout = 10000) {
    return defer((resolve, reject) => {
      var client   = null;
      var attempts = 1, max = retry;
      var connect  = () => {
        publish("utils.net.waitForwardingService.status", { type: 'try_connect', attempts: attempts, max: max });

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

  isOnlineCheck() {
    return defer(function (resolve, reject) {
      lazy.connectivity(function (online) {
        if (_.isBoolean(online)) {
          resolve(online);
        } else {
          reject(online);
        }
      });
    });
  }

};

export default net;
