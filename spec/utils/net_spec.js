import h from 'spec/spec_helper';
import { config, set_config, path } from 'azk';
import { subscribe } from 'azk/utils/postal';
import { async, promiseResolve, ninvoke, delay } from 'azk/utils/promises';
import { net as net_utils, envDefaultArray } from 'azk/utils';
var net = require('net');

var cache_key = "agent:dns:file_cache";

describe("Azk utils.net module", function() {
  it("should get a free port", function() {
    this.timeout(1000);
    var portrange = config("agent:portrange_start");
    return h.expect(net_utils.getPort()).to.eventually.above(portrange - 1);
  });

  it("should calculate net ips from a ip", function() {
    h.expect(net_utils.calculateNetIp('192.168.50.4')).to.equal('192.168.50.0/24');
    h.expect(net_utils.calculateGatewayIp('192.168.50.4')).to.equal('192.168.50.1');
  });

  describe('with nameservers', function() {
    var name_servers_options = {
      resolv_path: path.join(h.fixture_path('etc'), 'resolv.conf')
    };
    var env_dns_servers;

    before(() => {
      env_dns_servers = process.env.AZK_DNS_SERVERS;
      set_config(cache_key, null);
    });

    afterEach(() => {
      process.env.AZK_DNS_SERVERS = env_dns_servers;
      set_config(cache_key, null);
    });

    it('should custom', function () {
      var custom_nameservers        = ['208.67.222.222', '208.67.222.220'];
      var full_custom_nameservers   = [ config("agent:dns:ip") ].concat(custom_nameservers);

      h.expect(full_custom_nameservers).to.eql(net_utils.nameServers(custom_nameservers, name_servers_options));
      h.expect(full_custom_nameservers).isNull;
    });

    it('should env AZK_DNS_SERVERS', function() {
      process.env.AZK_DNS_SERVERS = '123.123.123.123,321.321.321.321';

      var dns_servers = envDefaultArray('AZK_DNS_SERVERS', []);
      var full_dns_servers   = [ config("agent:dns:ip") ].concat(dns_servers);

      h.expect(full_dns_servers).to.eql(net_utils.nameServers(name_servers_options));
    });

    it('should dns_servers of resolv.conf', function() {
      var dns_servers = ['189.38.95.95', '189.38.95.96'];
      var full_dns_servers   = [ config("agent:dns:ip") ].concat(dns_servers);

      h.expect(full_dns_servers).to.eql(net_utils.nameServers(name_servers_options));
    });
    it('should default', function () {
      var name_servers_options = { resolv_path: false };
      var default_nameservers       = config('agent:dns:defaultserver');
      var full_default_nameservers  = [ config("agent:dns:ip") ].concat(default_nameservers);

      h.expect(full_default_nameservers).to.eql(net_utils.nameServers(name_servers_options));
      h.expect(full_default_nameservers).to.eql(config(cache_key));
    });
  });

  describe("wait for service", function() {
    var server, port, unix;
    before(() => {
      return async(this, function* () {
        port = yield net_utils.getPort();
        unix = path.join(yield h.tmp_dir(), "unix.sock");
      });
    });

    afterEach((done) => {
      if (server) {
        server.close(done);
        server = null;
      } else {
        done();
      }
    });

    var runServer = (port_or_path) => {
      server = net.createServer(() => {});
      return ninvoke(server, 'listen', port_or_path)
        .then(() => {
          return delay(1000).then(function (result) {
            return result;
          });
        });
    };

    it("should wait for server", function() {

      var _subscription;

      var connect = () => {
        return net_utils.waitService("tcp://localhost:" + port, { timeout: 1000 });
      };

      return async(function* () {
        // not listening to utils.net.waitService.status
        yield h.expect(connect()).to.eventually.equal(false);

        // listening to utils.net.waitService.status
        _subscription = subscribe('utils.net.waitService.status', (event) => {
          // Connect before 2 attempts
          if (event.type == "try_connect" && event.attempts == 2) {
            runServer(port);
          }
        });

        yield h.expect(connect()).to.eventually.equal(true);
        _subscription.unsubscribe();
      })
      .catch(function (err) {
        if (_subscription) {
          _subscription.unsubscribe();
        }
        throw err;
      });
    });

    it("should wait for server runing in a unix socket", function() {
      var connect = () => {
        return net_utils.waitService("unix://" + unix, { timeout: 500 });
      };

      return async(function* () {
        yield h.expect(connect()).to.eventually.equal(false);
        yield runServer(unix);
        yield h.expect(connect()).to.eventually.equal(true);
      });
    });

    it("should stop retry", function() {
      var retry   = 0;
      var options = { timeout: 1000, retry_if: () => {
        retry++;
        return promiseResolve(false);
      }};

      return async(function* () {
        var result = net_utils.waitService("tcp://localhost:" + port, options);
        yield h.expect(result).to.eventually.equal(false);
        h.expect(retry).to.eql(1);
      });
    });
  });
});
