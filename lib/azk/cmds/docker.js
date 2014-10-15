module.exports = function() {
  "use strict";
  var __moduleName = "src/cmds/docker";
  var $__1 = require('azk'),
      _ = $__1._,
      async = $__1.async,
      log = $__1.log,
      config = $__1.config,
      utils = $__1.utils,
      dynamic = $__1.dynamic;
  var $__1 = require('azk/cli/command'),
      Command = $__1.Command,
      Helpers = $__1.Helpers;
  dynamic(this, {Manifest: function() {
      return require('azk/manifest').Manifest;
    }});
  var Cmd = function Cmd() {
    $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
  };
  var $Cmd = Cmd;
  ($traceurRuntime.createClass)(Cmd, {
    run_docker: function(opts) {
      return async(this, function() {
        var args,
            cmd,
            point,
            _path;
        return $traceurRuntime.generatorWrap(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                args = _.map(process.argv.slice(3), (function(arg) {
                  return arg.match(/^.* .*$/) ? ("\\\"" + arg + "\\\"") : arg;
                }));
                $ctx.state = 13;
                break;
              case 13:
                $ctx.state = (!config('agent:requires_vm')) ? 7 : 1;
                break;
              case 7:
                cmd = ("/bin/sh -c \"docker " + args.join(" ") + "\"");
                $ctx.state = 8;
                break;
              case 1:
                $ctx.state = 2;
                return Helpers.requireAgent(this);
              case 2:
                $ctx.maybeThrow();
                $ctx.state = 4;
                break;
              case 4:
                point = config('agent:vm:mount_point') + '.nfs';
                _path = utils.docker.resolvePath(this.cwd, point);
                cmd = ("azk vm ssh -t \"cd " + _path + "; docker " + args.join(" ") + "\" 2>/dev/null");
                $ctx.state = 8;
                break;
              case 8:
                log.debug("docker options: %s", cmd);
                $ctx.state = 15;
                break;
              case 15:
                $ctx.returnValue = this.execSh(cmd);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, this);
      });
    },
    action: function(opts) {
      return async(this, function() {
        var $__2,
            $__3,
            $__4;
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
                $__2 = this.run_docker;
                $__3 = $__2.call(this, opts);
                $ctx.state = 11;
                break;
              case 11:
                $ctx.state = 7;
                return $__3;
              case 7:
                $__4 = $ctx.sent;
                $ctx.state = 9;
                break;
              case 9:
                $ctx.returnValue = $__4;
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
  return {
    get init() {
      return init;
    },
    __esModule: true
  };
}.call(typeof global !== 'undefined' ? global : this);
//# sourceMappingURL=docker.js.map