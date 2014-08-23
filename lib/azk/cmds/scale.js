"use strict";
var __moduleName = "src/cmds/scale";
var $__2 = require('azk'),
    log = $__2.log,
    t = $__2.t,
    _ = $__2._,
    async = $__2.async,
    config = $__2.config,
    t = $__2.t;
var Manifest = require('azk/manifest').Manifest;
var $__2 = require('azk/cli/command'),
    Command = $__2.Command,
    Helpers = $__2.Helpers;
var VerboseCmd = require('azk/cli/verbose_cmd').VerboseCmd;
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
              systems = manifest.getSystemsByName(opts.system);
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
  },
  _formatAction: function(keys, event, system) {
    this.images_checked = this.images_checked || {};
    var data = {image: system.image.name};
    if (event.action == "check_image") {
      if (this.images_checked[data.image])
        return null;
      this.images_checked[data.image] = true;
    }
    this.ok($traceurRuntime.spread(keys, [event.action]), data);
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
            event.instances = t($traceurRuntime.spread(keys, ["instances"]), event);
            if ($__0.name != "scale") {
              var type = event.from > event.to ? "stopping" : "starting";
            } else {
              var type = event.from > event.to ? "scaling_down" : "scaling_up";
            }
            $__0.ok($traceurRuntime.spread(keys, [type]), event);
            break;
          case "wait_port":
          case "provision":
            $__0.ok($traceurRuntime.spread(keys, [event.type]), event);
            break;
          default:
            log.debug(event);
        }
      }
    });
    var options = {
      provision_force: opts.reprovision || false,
      remove: opts.remove
    };
    this.verbose_msg(1, (function() {
      options = _.merge(options, {
        provision_verbose: true,
        stdout: $__0.stdout(),
        stderr: $__0.stderr()
      });
    }));
    return system.scale(instances, options).progress(progress);
  }
}, {}, VerboseCmd);
;
function init(cli) {
  (new Cmd('scale [system] [to]', cli)).addOption(['--remove', '-r'], {default: true});
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