"use strict";
var __moduleName = "src/cmds/start";
var $__1 = require('azk'),
    log = $__1.log,
    _ = $__1._,
    async = $__1.async,
    config = $__1.config,
    t = $__1.t;
var $__1 = require('azk/cli/command'),
    Command = $__1.Command,
    Helpers = $__1.Helpers;
var Manifest = require('azk/manifest').Manifest;
var $__1 = require('azk/utils/errors'),
    SYSTEMS_CODE_ERROR = $__1.SYSTEMS_CODE_ERROR,
    NotBeenImplementedError = $__1.NotBeenImplementedError;
var ScaleCmd = require('azk/cmds/scale').Cmd;
var Cmd = function Cmd() {
  $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
};
var $Cmd = Cmd;
($traceurRuntime.createClass)(Cmd, {
  _scale: function(systems, action, opts) {
    var $__0 = this;
    var options = {
      start: {
        instances: {},
        key: "already"
      },
      stop: {
        instances: 0,
        key: "not_running"
      }
    };
    options = options[action];
    return async(this, function() {
      var system,
          result,
          ns,
          icc;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              result = 0;
              systems = _.clone(systems);
              $ctx.state = 13;
              break;
            case 13:
              $ctx.state = (system = systems.shift()) ? 5 : 9;
              break;
            case 5:
              ns = ["commands", action];
              this.verbose($traceurRuntime.spread(ns, ["verbose"]), system);
              $ctx.state = 6;
              break;
            case 6:
              $ctx.state = 2;
              return $traceurRuntime.superCall($__0, $Cmd.prototype, "_scale", [system, _.clone(options.instances), opts]);
            case 2:
              icc = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              if (icc == 0) {
                this.fail($traceurRuntime.spread(ns, [options.key]), system);
                result = SYSTEMS_CODE_ERROR;
              }
              $ctx.state = 13;
              break;
            case 9:
              ;
              $ctx.state = 15;
              break;
            case 15:
              $ctx.returnValue = result;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  start: function(manifest, systems, opts) {
    return this._scale(systems, 'start', opts);
  },
  stop: function(manifest, systems, opts) {
    systems = systems.reverse();
    return this._scale(systems, 'stop', opts);
  },
  reload: function(manifest, systems, opts) {
    this.fail('commands.reload.deprecation');
    return this.restart(manifest, systems, opts);
  },
  restart: function(manifest, systems, opts) {
    return async(this, function() {
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return this.stop(manifest, systems, opts);
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = 6;
              return this.start(manifest, systems, opts);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  }
}, {}, ScaleCmd);
function init(cli) {
  var cmds = [(new Cmd('start [system]', cli)).addOption(['--reprovision', '-R'], {default: false}), (new Cmd('stop [system]', cli)).addOption(['--remove', '-r'], {default: true}), (new Cmd('restart [system]', cli)).addOption(['--reprovision', '-R'], {default: false}), (new Cmd('reload [system]', cli)).addOption(['--reprovision', '-R'], {default: true})];
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=start.js.map