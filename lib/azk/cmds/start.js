"use strict";
var __moduleName = "src/cmds/start";
var $__4 = require('azk'),
    log = $__4.log,
    _ = $__4._,
    async = $__4.async,
    config = $__4.config,
    t = $__4.t;
var $__4 = require('azk/cli/command'),
    Command = $__4.Command,
    Helpers = $__4.Helpers;
var Manifest = require('azk/manifest').Manifest;
var $__4 = require('azk/utils/errors'),
    SYSTEMS_CODE_ERROR = $__4.SYSTEMS_CODE_ERROR,
    NotBeenImplementedError = $__4.NotBeenImplementedError;
var Cmd = function Cmd() {
  $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
};
var $Cmd = Cmd;
($traceurRuntime.createClass)(Cmd, {
  action: function(opts) {
    return async(this, function() {
      var manifest,
          systems;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return Helpers.requireAgent();
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              manifest = new Manifest(this.cwd, true);
              systems = Helpers.getSystemsByName(manifest, opts.system);
              $ctx.state = 17;
              break;
            case 17:
              $ctx.state = 6;
              return this[("" + this.name)](manifest, systems, opts);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = (_.contains(["start", "stop", "scale"], this.name)) ? 13 : -2;
              break;
            case 13:
              this.output("");
              $ctx.state = 14;
              break;
            case 14:
              $ctx.state = 10;
              return this.status(manifest, systems);
            case 10:
              $ctx.maybeThrow();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  _scale: function(system) {
    var instances = arguments[1] !== (void 0) ? arguments[1] : {};
    var $__0 = this;
    var progress = (function(event) {
      var pull_progress = Helpers.newPullProgress($__0);
      if (event.type == "pull_msg") {
        pull_progress(event);
      } else {
        var keys = ["commands", "scale"];
        switch (event.type) {
          case "action":
            var data = {image: system.image.name};
            $__0.tOutput($traceurRuntime.spread(keys, [event.action]), data);
            break;
          case "scale":
            $__0.tOutput($traceurRuntime.spread(keys, ["scale"]), event);
            break;
          case "provision":
            $__0.tOutput($traceurRuntime.spread(keys, ["provision"]), event);
            break;
          default:
            log.debug(event);
        }
      }
    });
    return system.scale(instances).progress(progress);
  },
  start: function(manifest, systems) {
    return async(this, function() {
      var i,
          system,
          icc;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 16;
              break;
            case 16:
              $ctx.state = (i < systems.length) ? 12 : -2;
              break;
            case 11:
              i++;
              $ctx.state = 16;
              break;
            case 12:
              system = systems[i];
              $ctx.state = 13;
              break;
            case 13:
              $ctx.state = 2;
              return this._scale(system);
            case 2:
              icc = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (icc == 0) ? 7 : 6;
              break;
            case 7:
              this.fail('commands.start.already', system);
              $ctx.state = 8;
              break;
            case 8:
              $ctx.returnValue = SYSTEMS_CODE_ERROR;
              $ctx.state = -2;
              break;
            case 6:
              $ctx.returnValue = 0;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  scale: function(manifest, systems, opts) {
    return async(this, function() {
      var i,
          system;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (i < systems.length) ? 5 : -2;
              break;
            case 4:
              i++;
              $ctx.state = 9;
              break;
            case 5:
              system = systems[i];
              $ctx.state = 6;
              break;
            case 6:
              $ctx.state = 2;
              return this._scale(system, parseInt(opts.to || 1));
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  stop: function(manifest, systems, opts) {
    return async(this, function() {
      var i,
          system,
          icc;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 16;
              break;
            case 16:
              $ctx.state = (i < systems.length) ? 12 : -2;
              break;
            case 11:
              i++;
              $ctx.state = 16;
              break;
            case 12:
              system = systems[i];
              $ctx.state = 13;
              break;
            case 13:
              $ctx.state = 2;
              return this._scale(system, 0);
            case 2:
              icc = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (icc == 0) ? 7 : 6;
              break;
            case 7:
              this.fail('commands.stop.not_running', system);
              $ctx.state = 8;
              break;
            case 8:
              $ctx.returnValue = SYSTEMS_CODE_ERROR;
              $ctx.state = -2;
              break;
            case 6:
              $ctx.returnValue = 0;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  status: function(manifest, systems) {
    var opts = arguments[2] !== (void 0) ? arguments[2] : {};
    var columns = ['System'.blue, 'Status'.green, 'Instances'.yellow, 'Hostname'.green, 'Instances-Ports'.magenta];
    var table_status = this.table_add('table_status', {head: columns});
    return async(this, function() {
      var $__2,
          $__3,
          system,
          instances,
          hostname,
          ports,
          status,
          counter,
          line;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__2 = systems[Symbol.iterator]();
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (!($__3 = $__2.next()).done) ? 13 : 15;
              break;
            case 13:
              system = $__3.value;
              $ctx.state = 14;
              break;
            case 14:
              $ctx.state = 2;
              return system.instances();
            case 2:
              instances = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              if (system.balanceable && instances.length > 0) {
                hostname = system.url;
              } else {
                hostname = system.hostname;
              }
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = 6;
              return this._ports_map(system, instances);
            case 6:
              ports = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              status = instances.length > 0 ? 'UP'.green : 'DOWN'.red;
              counter = system.scalable ? instances.length : '-';
              line = [system.name, status, counter, hostname, ports.join(', ')];
              this.table_push(table_status, line);
              $ctx.state = 12;
              break;
            case 15:
              this.table_show(table_status);
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  _ports_map: function(system, instances) {
    return async(this, function() {
      var instance,
          ports;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              ports = [];
              instances = _.clone(instances);
              while (instance = instances.pop()) {
                _.each(instance.NetworkSettings.Access, (function(port) {
                  var name = system.portName(port.name);
                  ports.push((instance.Annotations.azk.seq + "-" + name + ":" + (port.port || "n/m".red)));
                }));
              }
              $ctx.state = 4;
              break;
            case 4:
              $ctx.returnValue = _.isEmpty(ports) ? ["-"] : ports;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  reload: function(manifest, systems, opts) {
    throw new NotBeenImplementedError('reload');
  }
}, {}, Command);
function init(cli) {
  (new Cmd('start [system]', cli));
  (new Cmd('stop [system]', cli));
  (new Cmd('scale [system] [to]', cli));
  (new Cmd('status [system]', cli));
  (new Cmd('reload [system]', cli));
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=start.js.map