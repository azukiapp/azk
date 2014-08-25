"use strict";
var __moduleName = "src/system/run";
var $__1 = require('azk'),
    _ = $__1._,
    t = $__1.t,
    Q = $__1.Q,
    async = $__1.async,
    defer = $__1.defer,
    config = $__1.config;
var docker = require('azk/docker').default;
var $__1 = require('azk/utils/errors'),
    ImageNotAvailable = $__1.ImageNotAvailable,
    SystemRunError = $__1.SystemRunError,
    RunCommandError = $__1.RunCommandError;
var net = require('azk/utils/net').default;
var Balancer = require('azk/system/balancer').Balancer;
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
              options = _.defaults(options, {
                provision_force: false,
                provision_verbose: false
              });
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
              if (!options.provision_verbose) {
                options = _.clone(options);
                options.shell_type = "provision";
                options.stdout = new MemoryStream();
                options.stderr = options.stdout;
                options.stdout.on('data', (function(data) {
                  output += data.toString();
                }));
              } else {
                output = t("system.seelog");
              }
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
                throw new RunCommandError(system.name, cmd.join(' '), output);
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
      var deps_envs,
          docker_opt,
          container,
          data,
          $__2,
          $__3,
          $__4,
          $__5,
          $__6,
          $__7;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__2 = _.defaults;
              $__3 = this._getSequencies;
              $__4 = $__3.call(this, system);
              $ctx.state = 6;
              break;
            case 6:
              $ctx.state = 2;
              return $__4;
            case 2:
              $__5 = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $__6 = {
                remove: false,
                sequencies: $__5
              };
              $__7 = $__2.call(_, options, $__6);
              options = $__7;
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 10;
              return system.checkDependsAndReturnEnvs(options, false);
            case 10:
              deps_envs = $ctx.sent;
              $ctx.state = 12;
              break;
            case 12:
              options.envs = _.merge(deps_envs, options.envs || {});
              $ctx.state = 33;
              break;
            case 33:
              $ctx.state = 14;
              return this._check_image(system, options);
            case 14:
              $ctx.maybeThrow();
              $ctx.state = 16;
              break;
            case 16:
              docker_opt = system.shellOptions(options);
              $ctx.state = 35;
              break;
            case 35:
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
              $ctx.state = (options.remove) ? 25 : 28;
              break;
            case 25:
              $ctx.state = 26;
              return container.remove();
            case 26:
              $ctx.maybeThrow();
              $ctx.state = 28;
              break;
            case 28:
              $ctx.returnValue = {
                code: data.State.ExitCode,
                container: container,
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
          $__8,
          $__9,
          $__10,
          $__11,
          $__12,
          $__13,
          $__14;
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
              $ctx.state = 42;
              break;
            case 42:
              $ctx.state = 6;
              return system.runProvision(options);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              $__8 = _.defaults;
              $__9 = this._getSequencies;
              $__10 = $__9.call(this, system);
              $ctx.state = 14;
              break;
            case 14:
              $ctx.state = 10;
              return $__10;
            case 10:
              $__11 = $ctx.sent;
              $ctx.state = 12;
              break;
            case 12:
              $__12 = system.wait_scale;
              $__13 = {
                sequencies: $__11,
                wait: $__12
              };
              $__14 = $__8.call(_, options, $__13);
              options = $__14;
              $ctx.state = 16;
              break;
            case 16:
              docker_opt = system.daemonOptions(options);
              command = docker_opt.command;
              $ctx.state = 44;
              break;
            case 44:
              $ctx.state = 18;
              return docker.run(system.image.name, command, docker_opt);
            case 18:
              container = $ctx.sent;
              $ctx.state = 20;
              break;
            case 20:
              $ctx.state = (options.wait) ? 21 : 28;
              break;
            case 21:
              $ctx.state = 22;
              return container.inspect();
            case 22:
              data = $ctx.sent;
              $ctx.state = 24;
              break;
            case 24:
              port_data = _.chain(data.NetworkSettings.Access).filter((function(port) {
                return port.protocol == 'tcp';
              })).find().value();
              $ctx.state = 33;
              break;
            case 33:
              $ctx.state = (!_.isEmpty(port_data)) ? 29 : 28;
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
              $ctx.state = 36;
              return Balancer.add(system, container);
            case 36:
              $ctx.maybeThrow();
              $ctx.state = 38;
              break;
            case 38:
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
              $ctx.state = 36;
              break;
            case 36:
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
              $ctx.state = (container = instances.pop()) ? 28 : 32;
              break;
            case 28:
              container = docker.getContainer(container.Id);
              $ctx.state = 29;
              break;
            case 29:
              $ctx.state = 7;
              return Balancer.remove(system, container);
            case 7:
              $ctx.maybeThrow();
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (options.kill) ? 14 : 20;
              break;
            case 14:
              notify({
                type: 'kill_service',
                system: system.name
              });
              $ctx.state = 15;
              break;
            case 15:
              $ctx.state = 11;
              return container.kill();
            case 11:
              $ctx.maybeThrow();
              $ctx.state = 13;
              break;
            case 20:
              notify({
                type: 'stop_service',
                system: system.name
              });
              $ctx.state = 21;
              break;
            case 21:
              $ctx.state = 17;
              return container.stop();
            case 17:
              $ctx.maybeThrow();
              $ctx.state = 13;
              break;
            case 13:
              notify({
                type: "stopped",
                id: container.Id
              });
              $ctx.state = 31;
              break;
            case 31:
              $ctx.state = (options.remove) ? 23 : 4;
              break;
            case 23:
              $ctx.state = 24;
              return container.remove();
            case 24:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 32:
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
    return async(this, function(notify) {
      var host,
          wait_opts,
          address,
          running;
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
              notify(_.merge(port_data, {
                name: system.portName(port_data.name),
                type: "wait_port",
                system: system.name
              }));
              address = ("tcp://" + host + ":" + port_data.port);
              $ctx.state = 13;
              break;
            case 13:
              $ctx.state = 2;
              return net.waitService(address, retry, wait_opts);
            case 2:
              running = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (!running) ? 5 : 8;
              break;
            case 5:
              $ctx.state = 6;
              return this.throwRunError(system, container, null, true);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              $ctx.returnValue = true;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  throwRunError: function(system, container) {
    var data = arguments[2] !== (void 0) ? arguments[2] : null;
    var stop = arguments[3] !== (void 0) ? arguments[3] : false;
    var $__0 = this;
    data = data ? Q(data) : container.inspect();
    return data.then((function(data) {
      var promise = container.logs({
        stdout: true,
        stderr: true
      }).then((function(stream) {
        return defer((function(resolve, reject) {
          var acc = '';
          var stdout = {write: function(data) {
              acc += data.toString();
            }};
          container.modem.demuxStream(stream, stdout, stdout);
          stream.on('end', (function() {
            resolve(acc);
          }));
          setTimeout((function() {
            reject(new Error("timeout"));
          }), 4000);
        }));
      }));
      return promise.then((function(log) {
        var raise = (function() {
          throw new SystemRunError(system.name, container, data.Config.Cmd.join(' '), data.State.ExitCode, log);
        });
        if (stop) {
          return $__0.stop(system, [container], {
            kill: true,
            remove: true
          }).then(raise);
        } else {
          raise();
        }
      }));
    }));
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