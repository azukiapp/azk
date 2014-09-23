module.exports = function() {
  "use strict";
  var $__1;
  var __moduleName = "src/cmds/init";
  var $__2 = require('azk'),
      _ = $__2._,
      config = $__2.config,
      fs = $__2.fs,
      path = $__2.path,
      async = $__2.async,
      dynamic = $__2.dynamic;
  var $__2 = require('azk/cli/command'),
      Command = $__2.Command,
      Helpers = $__2.Helpers;
  dynamic(this, {
    Generator: function() {
      return require('azk/generator').Generator;
    },
    example_system: function() {
      return require('azk/generator').example_system;
    }
  });
  var Cmd = function Cmd() {
    $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
  };
  var $Cmd = Cmd;
  ($traceurRuntime.createClass)(Cmd, ($__1 = {}, Object.defineProperty($__1, "action", {
    value: function(opts) {
      return async(this, function() {
        var $__1,
            manifest,
            cwd,
            file,
            generator,
            systems;
        return $traceurRuntime.generatorWrap(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                manifest = config("manifest");
                cwd = opts.path || this.cwd;
                file = path.join(cwd, manifest);
                generator = new Generator(this);
                $ctx.state = 9;
                break;
              case 9:
                $ctx.state = (fs.existsSync(file) && !opts.force) ? 3 : 2;
                break;
              case 3:
                this.fail(this.tKeyPath("already"), manifest);
                $ctx.state = 4;
                break;
              case 4:
                $ctx.returnValue = 1;
                $ctx.state = -2;
                break;
              case 2:
                systems = generator.findSystems(cwd);
                if (_.isEmpty(systems)) {
                  this.fail(this.tKeyPath("not_found"));
                  systems = ($__1 = {}, Object.defineProperty($__1, example_system.name, {
                    value: example_system,
                    configurable: true,
                    enumerable: true,
                    writable: true
                  }), $__1);
                }
                generator.render({systems: systems}, file);
                this.ok(this.tKeyPath('generated'), manifest);
                if (fs.existsSync(path.join(cwd, ".git")))
                  this.tOutput(this.tKeyPath('github'));
                $ctx.state = 11;
                break;
              case 11:
                $ctx.returnValue = 0;
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, this);
      });
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__1), {}, Command);
  function init(cli) {
    return new Cmd('init [path]', cli).addOption(['--force', '-f'], {default: false});
  }
  return {
    get init() {
      return init;
    },
    __esModule: true
  };
}.call(typeof global !== 'undefined' ? global : this);
//# sourceMappingURL=init.js.map