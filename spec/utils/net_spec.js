import h from 'spec/spec_helper';
import { async, config, Q } from 'azk';
import { path } from 'azk';
import { net as net_utils } from 'azk/utils';
var net = require('net');

describe("Azk utils.net module", function() {
  it("should get a free port", function() {
    var portrange = config("agent:portrange_start");
    return h.expect(net_utils.getPort()).to.eventually.above(portrange - 1);
  });

  it("should calculate net ips from a ip", function() {
    h.expect(net_utils.calculateNetIp('192.168.50.4')).to.equal('192.168.50.0/24');
    h.expect(net_utils.calculateGatewayIp('192.168.50.4')).to.equal('192.168.50.1');
  });

  describe("wait for service", function() {
    var server, port, unix;
    before(() => {
      return async(this, function* () {
        port = yield net_utils.getPort();
        unix = path.join(yield h.tmp_dir(), "unix.socket");
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
      server = net.createServer((socket) => {
        socket.end("goodbye\n");
      })
      server.listen(port_or_path);
      return server;
    }

    it("should wait for server", function() {
      var events = [];
      var progress = (event) => {
        // Connect before 2 attempts
        if (event.type == "try_connect" && event.attempts == 2) {
          server = runServer(port);
        }
        events.push(event);
      }

      var connect = () => {
        return net_utils.waitService("tcp://localhost:" + port, 2, { timeout: 100 });
      }

      return async(function* () {
        yield h.expect(connect()).to.eventually.equal(false);
        yield h.expect(connect().progress(progress)).to.eventually.equal(true);
      });
    });

    it("should wait for server runing in a unix socket", function() {
      var events = [];
      var progress = (event) => {
        // Connect before 2 attempts
        if (event.type == "try_connect" && event.attempts == 2) {
          server = runServer(unix);
        }
        events.push(event);
      }

      var connect = () => {
        return net_utils.waitService("unix://" + unix, 2, { timeout: 100 });
      }

      return async(function* () {
        yield h.expect(connect()).to.eventually.equal(false);
        yield h.expect(connect().progress(progress)).to.eventually.equal(true);
      });
    });

    it("should stop retry", function() {
      var retry   = 0;
      var options = { timeout: 100, retry_if: () => {
        retry++;
        return Q(false);
      }};

      return async(function* () {
        var result = net_utils.waitService("tcp://localhost:" + port, 2, options);
        yield h.expect(result).to.eventually.equal(false);
        h.expect(retry).to.eql(1);
      });
    });
  });
});
