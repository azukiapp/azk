"use strict";
var __moduleName = "src/system/run";
var $__0 = require('azk'),
    _ = $__0._,
    async = $__0.async;
var docker = require('azk/docker').default;
var ImageNotAvailable = require('azk/utils/errors').ImageNotAvailable;
var Run = {
  runShell: function(system, command) {
    var options = arguments[2] !== (void 0) ? arguments[2] : {};
    return this.checkImage(system, options).then((function(image) {
      options = system.shellOptions(options);
      return docker.run(system.image.name, command, options);
    }));
  },
  runDaemon: function(system) {
    var options = arguments[1] !== (void 0) ? arguments[1] : {};
    return this.checkImage(system, options).then((function(image) {
      options.image_data = image;
      options = system.daemonOptions(options);
      var command = options.command;
      return docker.run(system.image.name, command, options);
    }));
  },
  checkImage: function(system, options) {
    options = _.defaults(options, {image_pull: true});
    return async(function() {
      var promise,
          image;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              if (options.image_pull) {
                promise = system.image.pull();
              } else {
                promise = system.image.check().then((function(image) {
                  if (image == null) {
                    throw new ImageNotAvailable(system.name, system.image.name);
                  }
                  return image;
                }));
              }
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 2;
              return promise.progress((function(event) {
                event.system = system;
                return event;
              }));
            case 2:
              image = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.returnValue = image.inspect();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  }
};
;
module.exports = {
  get Run() {
    return Run;
  },
  __esModule: true
};
//# sourceMappingURL=run.js.map