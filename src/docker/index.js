import { Q, config, _ } from 'azk';
import { Docker, Image, Container } from 'azk/docker/docker';

var url  = require('url');

module.exports = {
  get default() {
    if (!this.connect) {
      var opts = url.parse(config('docker:host'));

      if (opts.protocol == 'unix:') {
        opts = { socketPath: opts.pathname }
      } else {
        opts = {
          host: 'http://' + opts.hostname,
          port: opts.port,
        }
      }
      this.connect = new Docker(opts);
    }
    return this.connect;
  },

  get Docker()    { return Docker; },
  get Image()     { return Image; },
  get Container() { return Container; },
};
