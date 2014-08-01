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
              return this._scale(system, opts.instances);
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
  _hosts: function(system, instances) {
    if (instances.length >= 1) {
      var host = system.hostname;
      if (_.isObject(instances[0].Ports[0])) {
        var instance = instances[0];
        var port = instance.Ports[0].PublicPort;
        host = config('agent:balancer:host') + (port == 80 ? '' : (":" + port));
      }
      return host;
    }
    return "";
  },
  status: function(manifest, systems) {
    var opts = arguments[2] !== (void 0) ? arguments[2] : {};
    var columns = ['System'.blue, 'Instances'.yellow, 'Hosts'.green];
    var table_status = this.table_add('table_status', {head: columns});
    columns = ['Up Time'.green, 'Command'.cyan];
    if (opts.all) {
      columns.unshift('Status'.red);
      columns.unshift('Type'.magenta);
    }
    ;
    columns.unshift('Azk id'.blue);
    return async(this, function() {
      var $__5,
          $__2,
          $__3,
          system,
          instances,
          rows,
          table_name,
          line;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__2 = systems[Symbol.iterator]();
              $ctx.state = 6;
              break;
            case 6:
              $ctx.state = (!($__3 = $__2.next()).done) ? 7 : 9;
              break;
            case 7:
              system = $__3.value;
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 2;
              return system.instances({include_dead: opts.all});
            case 2:
              instances = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              if (opts.instances) {
                instances = _.sortBy(instances, function(container) {
                  return container.Created * -1;
                });
                rows = _.map(instances, function(container) {
                  var names = container.Names[0].split('.');
                  var row = [container.Status, container.Command];
                  if (opts.all) {
                    if (container.State.Running) {
                      var status = container.State.Paused ? 'paused'.blue : 'runnig'.green;
                    } else {
                      var status = container.State.ExitCode > 0 ? "dead".red : "ended".cyan;
                    }
                    var type = container.Annotations.azk.type;
                    if (type == "shell") {
                      type = (type + ": " + container.Annotations.azk.shell.white);
                    }
                    row.unshift(status);
                    row.unshift(type.magenta);
                  }
                  row.unshift(container.Id.slice(0, 12));
                  return row;
                });
                this.output(system.name + ": " + instances.length + " instances");
                table_name = 'table_' + system.name;
                this.table_add(table_name, {head: columns});
                ($__5 = this).table_push.apply($__5, $traceurRuntime.spread([table_name], rows));
                this.table_show(table_name);
              } else {
                line = [system.name, instances.length, this._hosts(system, instances) || "-"];
                this.table_push(table_status, line);
              }
              $ctx.state = 6;
              break;
            case 9:
              if (!opts.instances)
                this.table_show(table_status);
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
  },
  up: function(manifest, systems, opts) {
    throw new NotBeenImplementedError('up');
  }
}, {}, Command);
function init(cli) {
  (new Cmd('start [system]', cli));
  (new Cmd('stop [system]', cli));
  (new Cmd('scale [system]', cli)).addOption(['--instances', '-i'], {
    type: Number,
    default: 1
  });
  (new Cmd('status [system]', cli)).addOption(['--instances', '-i'], {default: false}).addOption(['--all', '-a'], {default: false});
  (new Cmd('reload [system]', cli));
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=start.js.map