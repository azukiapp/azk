"use strict";
var __moduleName = "src/cmds/start";
var $__4 = require('azk'),
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
          systems,
          systems_name;
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
              systems = [manifest.systemDefault];
              if (opts.system) {
                if (opts.system == ":all") {
                  systems = _.map(manifest.systems, (function(system) {
                    return system;
                  }));
                } else {
                  systems_name = opts.system.split(',');
                  systems = _.reduce(systems_name, (function(systems, name) {
                    systems.push(manifest.system(name, true));
                    return systems;
                  }), []);
                }
              }
              $ctx.state = 8;
              break;
            case 8:
              $ctx.returnValue = this[("" + this.name)](manifest, systems, opts);
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  _scale: function(system, instances) {
    var $__0 = this;
    var progress = (function(event) {
      var pull_progress = Helpers.newPullProgress($__0);
      if (event.type == "pull_msg") {
        pull_progress(event);
      } else {
        console.log(event);
      }
    });
    return system.provision().then((function() {
      return system.scale(instances, $__0.stdout(), true);
    })).progress(progress);
  },
  start: function(manifest, systems) {
    return async(this, function() {
      var $__2,
          $__3,
          system,
          containers;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__2 = systems[Symbol.iterator]();
              $ctx.state = 13;
              break;
            case 13:
              $ctx.state = (!($__3 = $__2.next()).done) ? 14 : -2;
              break;
            case 14:
              system = $__3.value;
              $ctx.state = 15;
              break;
            case 15:
              $ctx.state = 2;
              return system.instances();
            case 2:
              containers = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (containers.length > 0) ? 7 : 6;
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
              $ctx.state = 11;
              return this._scale(system, 1);
            case 11:
              $ctx.maybeThrow();
              $ctx.state = 13;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  scale: function(manifest, systems, opts) {
    return async(this, function() {
      var $__2,
          $__3,
          system;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__2 = systems[Symbol.iterator]();
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (!($__3 = $__2.next()).done) ? 5 : -2;
              break;
            case 5:
              system = $__3.value;
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
      var $__2,
          $__3,
          system,
          containers;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__2 = systems[Symbol.iterator]();
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = (!($__3 = $__2.next()).done) ? 12 : -2;
              break;
            case 12:
              system = $__3.value;
              $ctx.state = 13;
              break;
            case 13:
              $ctx.state = 2;
              return system.instances();
            case 2:
              containers = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (containers.length <= 0) ? 9 : 5;
              break;
            case 9:
              this.fail('commands.start.not_running', system);
              $ctx.state = 10;
              break;
            case 5:
              $ctx.state = 6;
              return this._scale(system, 0);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 10;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  _hosts: function(system, instances) {
    if (instances.length >= 1) {
      var hosts = system.hosts;
      if (hosts.length == 0) {
        var instance = instances[0];
        hosts = ['azk-agent:' + instance.Ports[0].PublicPort];
      }
      return hosts.join(', ');
    }
    return "";
  },
  status: function(manifest, systems, opts) {
    return async(this, function() {
      var $__2,
          $__3,
          system,
          instances;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              this.output("Systems status: ");
              $ctx.state = 12;
              break;
            case 12:
              $__2 = systems[Symbol.iterator]();
              $ctx.state = 6;
              break;
            case 6:
              $ctx.state = (!($__3 = $__2.next()).done) ? 7 : -2;
              break;
            case 7:
              system = $__3.value;
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 2;
              return system.instances(opts.all);
            case 2:
              instances = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              this.tOutput("commands.status.status", {
                system: system.name,
                instances: instances.length,
                hosts: this._hosts(system, instances)
              });
              $ctx.state = 6;
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
  (new Cmd('start', cli)).addOption(['--system', '-s'], {type: String});
  (new Cmd('stop', cli)).addOption(['--system', '-s'], {type: String});
  (new Cmd('scale', cli)).addOption(['--system', '-s'], {type: String}).addOption(['--instances', '-n'], {
    type: Number,
    default: 1
  });
  (new Cmd('status', cli)).addOption(['--system', '-s'], {
    type: String,
    default: ":all"
  }).addOption(['--all', '-a'], {default: false});
  (new Cmd('reload', cli)).addOption(['--system', '-s'], {type: String});
  (new Cmd('up', cli));
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=start.js.map