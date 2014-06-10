"use strict";
var __moduleName = "src/images/index";
var $__2 = require('azk'),
    async = $__2.async,
    defer = $__2.defer,
    _ = $__2._;
var $__2 = require('azk/docker'),
    DImage = $__2.Image,
    docker = $__2.default;
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
    var $__0 = this;
    return defer((function(_resolve, _reject, notify) {
      notify({
        type: "action",
        context: "image",
        action: "check_image"
      });
      return docker.findImage($__0.name);
    }));
  },
  pull: function(stdout) {
    return async(this, function(notify) {
      var image;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return this.check();
            case 2:
              image = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (image == null) ? 9 : 8;
              break;
            case 9:
              notify({
                type: "action",
                context: "image",
                action: "pull_image",
                data: this
              });
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = 6;
              return docker.pull(this.repository, this.tag, _.isObject(stdout) ? stdout : null);
            case 6:
              image = $ctx.sent;
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