"use strict";
var __moduleName = "src/docker/docker";
var uuid = require('node-uuid');
var $__4 = require('azk'),
    Q = $__4.Q,
    pp = $__4.pp,
    config = $__4.config,
    _ = $__4._,
    log = $__4.log;
var Utils = require('azk/utils').default;
var parseRepositoryTag = require('dockerode/lib/util').parseRepositoryTag;
var pull = require('azk/docker/pull').pull;
var run = require('azk/docker/run').run;
var Image = function Image() {
  $traceurRuntime.defaultSuperCall(this, $Image.prototype, arguments);
};
var $Image = Image;
($traceurRuntime.createClass)(Image, {}, {parseRepositoryTag: function() {
    for (var args = [],
        $__1 = 0; $__1 < arguments.length; $__1++)
      args[$__1] = arguments[$__1];
    return parseRepositoryTag.apply(null, $traceurRuntime.toObject(args));
  }}, Utils.qify('dockerode/lib/image'));
var Container = function Container() {
  $traceurRuntime.defaultSuperCall(this, $Container.prototype, arguments);
};
var $Container = Container;
($traceurRuntime.createClass)(Container, {}, {generateName: function(ns) {
    return (config('docker:namespace') + "." + ns + "." + uuid.v1().replace(/-/g, ""));
  }}, Utils.qify('dockerode/lib/container'));
var Docker = function Docker(opts) {
  log.info("Connect %s:%s", opts.host, opts.port);
  $traceurRuntime.superCall(this, $Docker.prototype, "constructor", [opts]);
};
var $Docker = Docker;
($traceurRuntime.createClass)(Docker, {
  getImage: function(name) {
    return new Image(this.modem, name);
  },
  getContainer: function(id) {
    return new Container(this.modem, id);
  },
  __findObj: function(obj) {
    return obj.inspect().then((function(_data) {
      return obj;
    }), (function(err) {
      if (err.statusCode == 404)
        return null;
      throw err;
    }));
  },
  findImage: function(name) {
    return this.__findObj(this.getImage(name));
  },
  findContainer: function(id) {
    return this.__findObj(this.getContainer(id));
  },
  pull: function() {
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$__2] = arguments[$__2];
    return pull.apply(null, $traceurRuntime.spread([this], args));
  },
  run: function() {
    for (var args = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      args[$__3] = arguments[$__3];
    return run.apply(null, $traceurRuntime.spread([this, Container], args));
  }
}, {}, Utils.qify('dockerode'));
module.exports = {
  get Image() {
    return Image;
  },
  get Container() {
    return Container;
  },
  get Docker() {
    return Docker;
  },
  __esModule: true
};
//# sourceMappingURL=docker.js.map