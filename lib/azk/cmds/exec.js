"use strict";
var __moduleName = "src/cmds/exec";
var $__1 = require('azk'),
    _ = $__1._,
    config = $__1.config,
    t = $__1.t,
    async = $__1.async;
var $__1 = require('azk/cli/command'),
    Command = $__1.Command,
    Helpers = $__1.Helpers;
var Manifest = require('azk/manifest').Manifest;
var Cmd = function Cmd() {
  $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
};
var $Cmd = Cmd;
($traceurRuntime.createClass)(Cmd, {action: function(opts) {
    var progress = Helpers.newPullProgress(this);
    return async(this, function() {
      var cmd,
          dir,
          env,
          manifest,
          system,
          options,
          $__2,
          $__3,
          $__4;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              cmd = $traceurRuntime.spread([opts.cmd], opts.__leftover);
              dir = this.cwd;
              env = {};
              $ctx.state = 19;
              break;
            case 19:
              $ctx.state = 2;
              return Helpers.requireAgent();
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              if (opts.image) {
                manifest = Manifest.makeFake(dir, opts.image);
                system = manifest.systemDefault;
              } else {
                manifest = new Manifest(dir, true);
                system = manifest.systemDefault;
                if (opts.system)
                  system = manifest.system(opts.system, true);
              }
              options = {
                pull: this.stdout().isTTY ? true : cmd.stdout(),
                interactive: opts.interactive,
                stdout: this.stdout(),
                stderr: this.stderr(),
                stdin: this.stdin()
              };
              $ctx.state = 21;
              break;
            case 21:
              $ctx.state = (!opts['skip-provision']) ? 5 : 8;
              break;
            case 5:
              $ctx.state = 6;
              return system.provision({force_provision: opts.reprovision});
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              $__2 = system.exec;
              $__3 = $__2.call(system, cmd, options);
              $ctx.state = 15;
              break;
            case 15:
              $ctx.state = 11;
              return $__3;
            case 11:
              $__4 = $ctx.sent;
              $ctx.state = 13;
              break;
            case 13:
              $ctx.returnValue = $__4;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    }).progress(progress);
  }}, {}, Command);
function init(cli) {
  (new Cmd('exec {*cmd}', cli)).addOption(['--system', '-s'], {type: String}).addOption(['--image', '-I'], {type: String}).addOption(['--interactive', '-i']).addOption(['--reprovision', '-r'], {default: false}).addOption(['--skip-provision', '-S'], {default: false});
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=exec.js.map