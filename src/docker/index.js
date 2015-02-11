import { fs, config, path } from 'azk';
import { Docker, Image, Container } from 'azk/docker/docker';

var url = require('url');

module.exports = {
  __esModule: true,

  get default() {
    if (!this.connect) {
      var opts = url.parse(config('docker:host'));

      if (opts.protocol == 'unix:') {
        opts = { socketPath: opts.pathname };
      } else {
        var protocol = opts.protocol;
        opts = {
          protocol: protocol.substring(0, protocol.length - 1),
          host : 'http://' + opts.hostname,
          port : opts.port,
          // ca   : fs.readFileSync(path.join(config('paths:pems'), 'ca.pem')),
          // cert : fs.readFileSync(path.join(config('paths:pems'), 'cert.pem')),
          // key  : fs.readFileSync(path.join(config('paths:pems'), 'key.pem')),
        };
      }
      this.connect = new Docker(opts);
    }
    return this.connect;
  },

  get Docker() { return Docker; },
  get Image() { return Image; },
  get Container() { return Container; },
};
