"use strict";
var __moduleName = "src/system/run";
var $__0 = require('azk'),
    _ = $__0._,
    async = $__0.async,
    config = $__0.config;
var docker = require('azk/docker').default;
var $__0 = require('azk/utils/errors'),
    ImageNotAvailable = $__0.ImageNotAvailable,
    SystemRunError = $__0.SystemRunError,
    RunCommandError = $__0.RunCommandError;
var net = require('azk/utils/net').default;
var MemoryStream = require('memorystream');
var Run = {
  runProvision: function(system) {
    var options = arguments[1] !== (void 0) ? arguments[1] : {};
    options = _.defaults(options, {provision_force: false});
    return async(this, function(notify) {
      var steps,
          cmd,
          output,
          exitResult;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              steps = system.provision_steps;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (_.isEmpty(steps)) ? 1 : 2;
              break;
            case 1:
              $ctx.returnValue = null;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = ((!options.provision_force) && system.provisioned) ? 4 : 5;
              break;
            case 4:
              $ctx.returnValue = null;
              $ctx.state = -2;
              break;
            case 5:
              cmd = ["/bin/sh", "-c", "( " + steps.join('; ') + " )"];
              output = "";
              options = _.clone(options);
              options.stdout = new MemoryStream();
              options.stdout.on('data', (function(data) {
                output += data.toString();
              }));
              notify({
                type: "provision",
                system: system.name
              });
              $ctx.state = 14;
              break;
            case 14:
              $ctx.state = 8;
              return system.runShell(cmd, options);
            case 8:
              exitResult = $ctx.sent;
              $ctx.state = 10;
              break;
            case 10:
              if (exitResult.code != 0) {
                throw new RunCommandError(cmd.join(' '), output);
              }
              this.provisioned = new Date();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  runShell: function(system, command) {
    var options = arguments[2] !== (void 0) ? arguments[2] : {};
    options = _.defaults(options, {remove: false});
    return async(this, function() {
      var docker_opt,
          container,
          data;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return this._check_image(system, options);
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              docker_opt = system.shellOptions(options);
              $ctx.state = 21;
              break;
            case 21:
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
              $ctx.state = (options.remove) ? 13 : 16;
              break;
            case 13:
              $ctx.state = 14;
              return container.remove();
            case 14:
              $ctx.maybeThrow();
              $ctx.state = 16;
              break;
            case 16:
              $ctx.returnValue = {
                code: data.State.ExitCode,
                containerId: container.Id,
                removed: options.remove
              };
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
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
          retry,
          timeout;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return this._check_image(system, options);
            case 2:
              image = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              options.image_data = image;
              $ctx.state = 27;
              break;
            case 27:
              $ctx.state = 6;
              return system.runProvision(options);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              docker_opt = system.daemonOptions(options);
              command = docker_opt.command;
              $ctx.state = 29;
              break;
            case 29:
              $ctx.state = 10;
              return docker.run(system.image.name, command, docker_opt);
            case 10:
              container = $ctx.sent;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 14;
              return container.inspect();
            case 14:
              data = $ctx.sent;
              $ctx.state = 16;
              break;
            case 16:
              port_data = _.find(data.NetworkSettings.Access, (function(port) {
                return port.protocol == 'tcp';
              }));
              $ctx.state = 31;
              break;
            case 31:
              $ctx.state = (port_data) ? 21 : 20;
              break;
            case 21:
              retry = options.timeout || config('docker:run:retry');
              timeout = options.retry || config('docker:run:timeout');
              $ctx.state = 22;
              break;
            case 22:
              $ctx.state = 18;
              return this._wait_available(system, port_data, container, retry, timeout);
            case 18:
              $ctx.maybeThrow();
              $ctx.state = 20;
              break;
            case 20:
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
    var options = arguments[2] !== (void 0) ? arguments[2] : {};
    options = _.defaults(options, {
      kill: false,
      remove: true
    });
    return async(function(notify) {
      var container;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              container = null;
              $ctx.state = 27;
              break;
            case 27:
              $ctx.state = (container = instances.pop()) ? 19 : 23;
              break;
            case 19:
              container = docker.getContainer(container.Id);
              $ctx.state = 20;
              break;
            case 20:
              $ctx.state = (options.kill) ? 5 : 11;
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
              $ctx.state = 22;
              break;
            case 22:
              $ctx.state = (options.remove) ? 14 : 27;
              break;
            case 14:
              $ctx.state = 15;
              return container.remove();
            case 15:
              $ctx.maybeThrow();
              $ctx.state = 27;
              break;
            case 23:
              $ctx.returnValue = true;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  _wait_available: function(system, port_data, container, retry, timeout) {
    return async(this, function() {
      var host,
          wait_opts,
          running,
          data,
          log;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              if (config('agent:requires_vm')) {
                host = config('agent:vm:ip');
              } else {
                host = port_data.gateway;
              }
              wait_opts = {
                timeout: timeout,
                retry_if: (function() {
                  return container.inspect().then((function(data) {
                    return data.State.Running;
                  }));
                })
              };
              $ctx.state = 19;
              break;
            case 19:
              $ctx.state = 2;
              return net.waitService(host, port_data.port, retry, wait_opts);
            case 2:
              running = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (!running) ? 5 : 14;
              break;
            case 5:
              $ctx.state = 6;
              return container.inspect();
            case 6:
              data = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 10;
              return container.logs({
                stdout: true,
                stderr: true
              });
            case 10:
              log = $ctx.sent;
              $ctx.state = 12;
              break;
            case 12:
              throw new SystemRunError(system.name, container, data.Config.Cmd.join(' '), data.State.ExitCode, log);
              $ctx.state = 14;
              break;
            case 14:
              $ctx.returnValue = true;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  _check_image: function(system, options) {
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