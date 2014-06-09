"use strict";
var __moduleName = "src/images/index";
var $__1 = require('azk'),
    async = $__1.async,
    _ = $__1._;
var $__1 = require('azk/docker'),
    DImage = $__1.Image,
    docker = $__1.default;
var default_tag = "latest";
var Image = function Image(image) {
  if (_.isString(image)) {
    this.name = image;
  } else {
    this.repository = image.repository;
    this.tag = image.tag || default_tag;
  }
};
($traceurRuntime.createClass)(Image, {
  check: function() {
    return docker.findImage(this.name);
  },
  pull: function(stdout) {
    var self = this;
    return async(function() {
      var image;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return self.check();
            case 2:
              image = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (image == null) ? 5 : 8;
              break;
            case 5:
              $ctx.state = 6;
              return docker.pull(self.repository, self.tag, _.isObject(stdout) ? stdout : null);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              $ctx.returnValue = image;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  set name(value) {
    var image = DImage.parseRepositoryTag(value);
    this.repository = image.repository;
    this.tag = image.tag || default_tag;
  },
  get name() {
    return (this.repository + ":" + this.tag);
  }
}, {});
module.exports = {
  get Image() {
    return Image;
  },
  __esModule: true
};
//# sourceMappingURL=index.js.map