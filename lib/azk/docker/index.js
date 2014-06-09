"use strict";
var __moduleName = "src/docker/index";
var $__0 = require('azk'),
    Q = $__0.Q,
    config = $__0.config,
    _ = $__0._;
var $__0 = require('azk/docker/docker'),
    Docker = $__0.Docker,
    Image = $__0.Image,
    Container = $__0.Container;
var url = require('url');
module.exports = {
  get default() {
    if (!this.connect) {
      var opts = url.parse(config('docker:host'));
      if (opts.protocol == 'unix:') {
        opts = {socketPath: opts.pathname};
      } else {
        opts = {
          host: 'http://' + opts.hostname,
          port: opts.port
        };
      }
      this.connect = new Docker(opts);
    }
    return this.connect;
  },
  get Docker() {
    return Docker;
  },
  get Image() {
    return Image;
  },
  get Container() {
    return Container;
  }
};
//# sourceMappingURL=index.js.map