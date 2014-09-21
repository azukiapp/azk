"use strict";
var __moduleName = "src/cmds/docker";
var $__2 = require('azk'),
    _ = $__2._,
    path = $__2.path,
    async = $__2.async,
    defer = $__2.defer,
    log = $__2.log,
    config = $__2.config,
    utils = $__2.utils;
var $__2 = require('azk/cli/command'),
    Command = $__2.Command,
    Helpers = $__2.Helpers;
var Manifest = require('azk/manifest').Manifest;
var Cmd = function Cmd() {
  $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
};
var $Cmd = Cmd;
($traceurRuntime.createClass)(Cmd, {
  get docker() {
    return require('azk/docker').default;
  },
  run_docker: function(opts) {
    var $__0 = this;
    return defer((function(resolve, reject) {
      var args = _.map(process.argv.slice(3), (function(arg) {
        return arg.match(/^.* .*$/) ? ("\\\"" + arg + "\\\"") : arg;
      }));
      if (!config('agent:requires_vm')) {
        var cmd = ("/bin/sh -c \"docker " + args.join(" ") + "\"");
      } else {
        var point = config('agent:vm:mount_point') + '.nfs';
        var _path = utils.docker.resolvePath($__0.cwd, point);
        var cmd = ("azk vm ssh -t \"cd " + _path + "; docker " + args.join(" ") + "\"");
      }
      log.debug("docker options: %s", cmd);
      $__0.execSh(cmd, (function(err) {
        resolve((err) ? err.code : 0);
      }));
    }));
  },
  action: function(opts) {
    return async(this, function() {
      var $__3,
          $__4,
          $__5;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = (config('agent:requires_vm')) ? 1 : 4;
              break;
            case 1:
              $ctx.state = 2;
              return Helpers.requireAgent();
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              $__3 = this.run_docker;
              $__4 = $__3.call(this, opts);
              $ctx.state = 11;
              break;
            case 11:
              $ctx.state = 7;
              return $__4;
            case 7:
              $__5 = $ctx.sent;
              $ctx.state = 9;
              break;
            case 9:
              $ctx.returnValue = $__5;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  }
}, {}, Command);
function init(cli) {
  return (new Cmd('docker [*dockerargs]', cli));
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=docker.js.map