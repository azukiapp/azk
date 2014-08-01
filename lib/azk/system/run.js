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
              options = _.defaults(options, {provision_force: false});
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
              options.shell_type = "provision";
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
              system.provisioned = new Date();
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
    return async(this, function() {
      var docker_opt,
          container,
          data,
          $__1,
          $__2,
          $__3,
          $__4,
          $__5,
          $__6;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__1 = _.defaults;
              $__2 = this._getSequencies;
              $__3 = $__2.call(this, system);
              $ctx.state = 6;
              break;
            case 6:
              $ctx.state = 2;
              return $__3;
            case 2:
              $__4 = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $__5 = {
                remove: false,
                sequencies: $__4
              };
              $__6 = $__1.call(_, options, $__5);
              options = $__6;
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 10;
              return this._check_image(system, options);
            case 10:
              $ctx.maybeThrow();
              $ctx.state = 12;
              break;
            case 12:
              docker_opt = system.shellOptions(options);
              $ctx.state = 29;
              break;
            case 29:
              $ctx.state = 14;
              return docker.run(system.image.name, command, docker_opt);
            case 14:
              container = $ctx.sent;
              $ctx.state = 16;
              break;
            case 16:
              $ctx.state = 18;
              return container.inspect();
            case 18:
              data = $ctx.sent;
              $ctx.state = 20;
              break;
            case 20:
              $ctx.state = (options.remove) ? 21 : 24;
              break;
            case 21:
              $ctx.state = 22;
              return container.remove();
            case 22:
              $ctx.maybeThrow();
              $ctx.state = 24;
              break;
            case 24:
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
          timeout,
          $__7,
          $__8,
          $__9,
          $__10,
          $__11,
          $__12;
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
              $ctx.state = 35;
              break;
            case 35:
              $ctx.state = 6;
              return system.runProvision(options);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              $__7 = _.defaults;
              $__8 = this._getSequencies;
              $__9 = $__8.call(this, system);
              $ctx.state = 14;
              break;
            case 14:
              $ctx.state = 10;
              return $__9;
            case 10:
              $__10 = $ctx.sent;
              $ctx.state = 12;
              break;
            case 12:
              $__11 = {sequencies: $__10};
              $__12 = $__7.call(_, options, $__11);
              options = $__12;
              $ctx.state = 16;
              break;
            case 16:
              docker_opt = system.daemonOptions(options);
              command = docker_opt.command;
              $ctx.state = 37;
              break;
            case 37:
              $ctx.state = 18;
              return docker.run(system.image.name, command, docker_opt);
            case 18:
              container = $ctx.sent;
              $ctx.state = 20;
              break;
            case 20:
              $ctx.state = 22;
              return container.inspect();
            case 22:
              data = $ctx.sent;
              $ctx.state = 24;
              break;
            case 24:
              port_data = _.find(data.NetworkSettings.Access, (function(port) {
                return port.protocol == 'tcp';
              }));
              $ctx.state = 39;
              break;
            case 39:
              $ctx.state = (port_data) ? 29 : 28;
              break;
            case 29:
              retry = options.timeout || config('docker:run:retry');
              timeout = options.retry || config('docker:run:timeout');
              $ctx.state = 30;
              break;
            case 30:
              $ctx.state = 26;
              return this._wait_available(system, port_data, container, retry, timeout);
            case 26:
              $ctx.maybeThrow();
              $ctx.state = 28;
              break;
            case 28:
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
              $ctx.state = 32;
              break;
            case 32:
              $ctx.state = (_.isEmpty(instances)) ? 1 : 4;
              break;
            case 1:
              $ctx.state = 2;
              return system.instances();
            case 2:
              instances = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (container = instances.pop()) ? 24 : 28;
              break;
            case 24:
              container = docker.getContainer(container.Id);
              $ctx.state = 25;
              break;
            case 25:
              $ctx.state = (options.kill) ? 10 : 16;
              break;
            case 10:
              notify({
                type: 'kill_service',
                system: system.name
              });
              $ctx.state = 11;
              break;
            case 11:
              $ctx.state = 7;
              return container.kill();
            case 7:
              $ctx.maybeThrow();
              $ctx.state = 9;
              break;
            case 16:
              notify({
                type: 'stop_service',
                system: system.name
              });
              $ctx.state = 17;
              break;
            case 17:
              $ctx.state = 13;
              return container.stop();
            case 13:
              $ctx.maybeThrow();
              $ctx.state = 9;
              break;
            case 9:
              notify({
                type: "stopped",
                id: container.Id
              });
              $ctx.state = 27;
              break;
            case 27:
              $ctx.state = (options.remove) ? 19 : 4;
              break;
            case 19:
              $ctx.state = 20;
              return container.remove();
            case 20:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 28:
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
              $ctx.state = 23;
              break;
            case 23:
              $ctx.state = 2;
              return net.waitService(host, port_data.port, retry, wait_opts);
            case 2:
              running = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (!running) ? 5 : 18;
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
              $ctx.state = 14;
              return this.stop(system, [container], {
                kill: true,
                remove: true
              });
            case 14:
              $ctx.maybeThrow();
              $ctx.state = 16;
              break;
            case 16:
              throw new SystemRunError(system.name, container, data.Config.Cmd.join(' '), data.State.ExitCode, log);
              $ctx.state = 18;
              break;
            case 18:
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
  },
  _getSequencies: function(system) {
    var type = arguments[1] !== (void 0) ? arguments[1] : "*";
    return async(this, function() {
      var instances;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return system.instances({type: type});
            case 2:
              instances = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.returnValue = _.reduce(instances, (function(sequencies, instance) {
                var type = instance.Annotations.azk.type;
                var seq = parseInt(instance.Annotations.azk.seq);
                if (seq === sequencies[type]) {
                  sequencies[type] = sequencies[type] + 1;
                }
                return sequencies;
              }), {
                shell: 1,
                daemon: 1
              });
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  instances: function(system) {
    var options = arguments[1] !== (void 0) ? arguments[1] : {};
    options = _.defaults(options, {
      include_dead: false,
      include_exec: false,
      type: "*"
    });
    var query_options = {};
    if (options.include_dead)
      query_options.all = true;
    return docker.azkListContainers(query_options).then((function(containers) {
      var instances = _.filter(containers, (function(container) {
        var azk = container.Annotations.azk;
        return (azk.mid == system.manifest.namespace && azk.sys == system.name && (options.type == "*" || azk.type == options.type));
      }));
      return _.sortBy(instances, (function(instance) {
        return instance.Annotations.azk.seq;
      }));
    }));
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