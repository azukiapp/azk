import { Q, config, unders as _ } from 'azk';
import { Docker, Image, Container } from 'azk/docker/docker';

var url  = require('url');

module.exports = {
  get default() {
    if (!this.connect) {
      var opts = url.parse(config('docker:host'));
      this.connect = new Docker({
        host: 'http://' + opts.hostname,
        port: opts.port,
      });
    }
    return this.connect;
  },

  get Docker()    { return Docker; },
  get Image()     { return Image; },
  get Container() { return Container; },
};
