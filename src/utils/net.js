import { Q, defer, config } from 'azk';

var nativeNet = require('net');
var dns       = require('dns');
var portrange = config("agent:portrange_start");

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
        done.resolve(getPort());
      });
    });
  },

  calculateNetIp(ip) {
    return ip.replace(/^(.*)\..*$/, "$1.1");
  },

  getAgentIp(name) {
    return Q.nfcall(dns.lookup, name).then((result) => {
      return result[0];
    });
  }
}

export default net;
