"use strict";
var __moduleName = "src/cmds/scale";
var $__3 = require('azk'),
    log = $__3.log,
    _ = $__3._,
    async = $__3.async,
    config = $__3.config,
    t = $__3.t;
var $__3 = require('azk/cli/command'),
    Command = $__3.Command,
    Helpers = $__3.Helpers;
var Manifest = require('azk/manifest').Manifest;
var $__3 = require('azk/utils/errors'),
    SYSTEMS_CODE_ERROR = $__3.SYSTEMS_CODE_ERROR,
    NotBeenImplementedError = $__3.NotBeenImplementedError;
var StatusCmd = require('azk/cmds/status').Cmd;
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
              this.verbose_active = opts.verbose;
              $ctx.state = 14;
              break;
            case 14:
              $ctx.state = 6;
              return this[("" + this.name)](manifest, systems, opts);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              this.output("");
              $ctx.state = 16;
              break;
            case 16:
              $ctx.state = 10;
              return StatusCmd.status(this, manifest, systems);
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
  verbose: function() {
    var $__4;
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$__2] = arguments[$__2];
    if (this.verbose_active) {
      ($__4 = this).tOutput.apply($__4, $traceurRuntime.toObject(args));
    }
  },
  _formatAction: function(keys, event, system) {
    this.images_checked = this.images_checked || {};
    var data = {image: system.image.name};
    if (event.action == "check_image") {
      if (this.images_checked[data.image])
        return null;
      this.images_checked[data.image] = true;
    }
    this.tOutput($traceurRuntime.spread(keys, [event.action]), data);
  },
  _scale: function(system) {
    var instances = arguments[1] !== (void 0) ? arguments[1] : {};
    var opts = arguments[2];
    var $__0 = this;
    var progress = (function(event) {
      var pull_progress = Helpers.newPullProgress($__0);
      if (event.type == "pull_msg") {
        pull_progress(event);
      } else {
        var keys = ["commands", "scale"];
        switch (event.type) {
          case "action":
            $__0._formatAction(keys, event, system);
            break;
          case "scale":
          case "provision":
            $__0.tOutput($traceurRuntime.spread(keys, [event.type]), event);
            break;
          default:
            log.debug(event);
        }
      }
    });
    return system.scale(instances, {provision_force: opts.reprovision || false}).progress(progress);
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
              return this._scale(system, parseInt(opts.to || 1), opts);
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  }
}, {}, Command);
;
function init(cli) {
  (new Cmd('scale [system] [to]', cli)).addOption(['--verbose', '-v'], {defaut: false});
}
module.exports = {
  get Cmd() {
    return Cmd;
  },
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=scale.js.map