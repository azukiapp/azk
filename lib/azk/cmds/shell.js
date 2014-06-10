"use strict";
var __moduleName = "src/cmds/shell";
var $__1 = require('azk'),
    _ = $__1._,
    path = $__1.path,
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
($traceurRuntime.createClass)(Cmd, {action: function(opts, extras) {
    var progress = Helpers.newPullProgress(this);
    return async(this, function() {
      var cmd,
          dir,
          env,
          manifest,
          system,
          tty_default,
          tty,
          options,
          i,
          point,
          j,
          variable,
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
              $ctx.state = 38;
              break;
            case 38:
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
              tty_default = opts.t || !_.isString(opts.command);
              tty = (opts.T) ? (opts.t || false) : tty_default;
              options = {
                interactive: tty,
                pull: this.stdout(),
                stdout: this.stdout(),
                stderr: this.stderr(),
                stdin: this.stdin(),
                workdir: opts.cwd || null,
                volumes: {},
                env: {}
              };
              $ctx.state = 40;
              break;
            case 40:
              i = 0;
              $ctx.state = 16;
              break;
            case 16:
              $ctx.state = (i < opts.mount.length) ? 12 : 14;
              break;
            case 10:
              i++;
              $ctx.state = 16;
              break;
            case 12:
              point = opts.mount[i];
              $ctx.state = 13;
              break;
            case 13:
              $ctx.state = (point.match(".*:.*")) ? 9 : 7;
              break;
            case 9:
              point = point.split(':');
              point[0] = path.resolve(this.cwd, point[0]);
              options.volumes[point[0]] = point[1];
              $ctx.state = 10;
              break;
            case 7:
              this.fail('commands.shell.invalid_mount', {point: point});
              $ctx.state = 8;
              break;
            case 8:
              $ctx.returnValue = 1;
              $ctx.state = -2;
              break;
            case 14:
              j = 0;
              $ctx.state = 28;
              break;
            case 28:
              $ctx.state = (j < opts.env.length) ? 24 : 26;
              break;
            case 22:
              j++;
              $ctx.state = 28;
              break;
            case 24:
              variable = opts.env[i];
              $ctx.state = 25;
              break;
            case 25:
              $ctx.state = (variable.match(".*=.*")) ? 21 : 19;
              break;
            case 21:
              variable = variable.split('=');
              options.env[variable[0]] = variable[1];
              $ctx.state = 22;
              break;
            case 19:
              this.fail('commands.shell.invalid_env', {variable: variable});
              $ctx.state = 20;
              break;
            case 20:
              $ctx.returnValue = 1;
              $ctx.state = -2;
              break;
            case 26:
              cmd = [opts.shell];
              if (opts.command) {
                cmd.push("-c");
                cmd.push(opts.command);
              }
              $ctx.state = 42;
              break;
            case 42:
              $__2 = system.exec;
              $__3 = $__2.call(system, cmd, options);
              $ctx.state = 34;
              break;
            case 34:
              $ctx.state = 30;
              return $__3;
            case 30:
              $__4 = $ctx.sent;
              $ctx.state = 32;
              break;
            case 32:
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
  (new Cmd('shell', cli)).addOption(['-T']).addOption(['-t']).addOption(['--system', '-s'], {type: String}).addOption(['--image', '-i'], {type: String}).addOption(['--command', '-c'], {type: String}).addOption(['--shell'], {
    default: "/bin/sh",
    type: String
  }).addOption(['--cwd', '-C'], {type: String}).addOption(['--mount', '-m'], {
    type: String,
    acc: true,
    default: []
  }).addOption(['--env', '-e'], {
    type: String,
    acc: true,
    default: []
  }).addOption(['--verbose', '-v']).addExamples(t("commands.shell.examples"));
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=shell.js.map