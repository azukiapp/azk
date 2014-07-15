import h from 'spec/spec_helper';
import { async, config, Q } from 'azk';
import { net as net_utils } from 'azk/utils';
var net = require('net');

describe("azk utils.net module", function() {
  it("should get a free port", function() {
    var portrange = config("agent:portrange_start");
    return h.expect(net_utils.getPort()).to.eventually.above(portrange - 1);
  });

  it("should calculate net ips from a ip", function() {
    h.expect(net_utils.calculateNetIp('192.168.50.4')).to.equal('192.168.50.0/24');
    h.expect(net_utils.calculateGatewayIp('192.168.50.4')).to.equal('192.168.50.1');
  });

  describe("wait for service", function() {
    var port;
    before(() => { net_utils.getPort().then((p) => port = p) });

    var runServer = () => {
      var server = net.createServer((socket) => {
        socket.end("goodbye\n");
      })
      server.listen(port);
      return server;
    }

    it("should wait for server", function() {
      var events = [];
      var server = null;
      var progress = (event) => {
        // Connect before 2 attempts
        if (event.type == "try_connect" && event.attempts == 2) {
          server = runServer();
        }
        events.push(event);
      }

      var connect = () => {
        return net_utils.waitService("localhost", port, 2, { timeout: 100 });
      }

      return async(function* () {
        yield h.expect(connect()).to.eventually.equal(false);
        yield h.expect(connect().progress(progress)).to.eventually.equal(true);
        server.close();
      });
    });

    it("should stop retry", function() {
      var retry   = 0;
      var options = { timeout: 100, retry_if: () => {
        retry++;
        return Q(false);
      }};

      return async(function* () {
        var result = net_utils.waitService("localhost", port, 2, options);
        yield h.expect(result).to.eventually.equal(false);
        h.expect(retry).to.eql(1);
      });
    });
  });
});
