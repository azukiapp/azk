"use strict";
var __moduleName = "src/system/run";
var $__0 = require('azk'),
    _ = $__0._,
    async = $__0.async,
    config = $__0.config;
var docker = require('azk/docker').default;
var $__0 = require('azk/utils/errors'),
    ImageNotAvailable = $__0.ImageNotAvailable,
    SystemRunError = $__0.SystemRunError;
var net = require('azk/utils/net').default;
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
    return async(this, function(notify) {
      var image,
          docker_opt,
          command,
          container,
          data,
          port_data,
          host,
          retry,
          timeout,
          wait_opts,
          running,
          log;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return this.checkImage(system, options);
            case 2:
              image = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              options.image_data = image;
              docker_opt = system.daemonOptions(options);
              command = docker_opt.command;
              $ctx.state = 34;
              break;
            case 34:
              $ctx.state = 6;
              return docker.run(system.image.name, command, docker_opt);
            case 6:
              container = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 10;
              return container.inspect();
            case 10:
              data = $ctx.sent;
              $ctx.state = 12;
              break;
            case 12:
              port_data = _.find(data.NetworkSettings.Access);
              $ctx.state = 36;
              break;
            case 36:
              $ctx.state = (port_data) ? 28 : 26;
              break;
            case 28:
              if (config('agent:requires_vm')) {
                host = config('agent:vm:ip');
              } else {
                host = port.gateway;
              }
              retry = options.timeout || config('docker:run:retry');
              timeout = options.retry || config('docker:run:timeout');
              wait_opts = {
                timeout: timeout,
                retry_if: (function() {
                  return container.inspect().then((function(data) {
                    return data.State.Running;
                  }));
                })
              };
              $ctx.state = 29;
              break;
            case 29:
              $ctx.state = 14;
              return net.waitService(host, port_data.port, retry, wait_opts);
            case 14:
              running = $ctx.sent;
              $ctx.state = 16;
              break;
            case 16:
              $ctx.state = (!running) ? 17 : 26;
              break;
            case 17:
              $ctx.state = 18;
              return container.inspect();
            case 18:
              data = $ctx.sent;
              $ctx.state = 20;
              break;
            case 20:
              $ctx.state = 22;
              return container.logs({
                stdout: true,
                stderr: true
              });
            case 22:
              log = $ctx.sent;
              $ctx.state = 24;
              break;
            case 24:
              throw new SystemRunError(system.name, container, data.Config.Cmd.join(' '), data.State.ExitCode, log);
              $ctx.state = 26;
              break;
            case 26:
              $ctx.returnValue = container;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  stop: function(system, instances) {
    var kill = arguments[2] !== (void 0) ? arguments[2] : false;
    return async(function(notify) {
      var container;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              container = null;
              $ctx.state = 22;
              break;
            case 22:
              $ctx.state = (container = instances.pop()) ? 16 : -2;
              break;
            case 16:
              container = docker.getContainer(container.Id);
              $ctx.state = 17;
              break;
            case 17:
              $ctx.state = (kill) ? 5 : 11;
              break;
            case 5:
              notify({
                type: 'kill_service',
                system: system.name
              });
              $ctx.state = 6;
              break;
            case 6:
              $ctx.state = 2;
              return container.kill();
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 11:
              notify({
                type: 'stop_service',
                system: system.name
              });
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 8;
              return container.stop();
            case 8:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              notify({
                type: "stopped",
                id: container.Id
              });
              $ctx.state = 19;
              break;
            case 19:
              $ctx.returnValue = container.remove();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
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