"use strict";
var $__2;
var __moduleName = "src/cmds/info";
var $__3 = require('azk'),
    _ = $__3._,
    async = $__3.async,
    config = $__3.config;
var Command = require('azk/cli/command').Command;
var Manifest = require('azk/manifest').Manifest;
var prettyjson = require('prettyjson');
var Cmd = function Cmd() {
  $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
};
var $Cmd = Cmd;
($traceurRuntime.createClass)(Cmd, ($__2 = {}, Object.defineProperty($__2, "action", {
  value: function(opts) {
    return async(this, function() {
      var $__0,
          manifest,
          options;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__0 = this;
              manifest = new Manifest(this.cwd, true);
              options = {
                noColor: opts.colored ? false : true,
                dashColor: "magenta",
                stringColor: "blue"
              };
              _.each(manifest.systems, (function(system) {
                var $__2;
                var data = ($__2 = {}, Object.defineProperty($__2, system.name, {
                  value: {
                    depends: system.options.depends,
                    image: system.image.name,
                    command: $__0._format_command(system.command),
                    ports: system.ports
                  },
                  configurable: true,
                  enumerable: true,
                  writable: true
                }), $__2);
                $__0.output(prettyjson.render(data, options));
                $__0.output();
              }));
              $ctx.state = 4;
              break;
            case 4:
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
}), Object.defineProperty($__2, "_format_command", {
  value: function(commands) {
    commands = _.map(commands, (function(cmd) {
      return (cmd.match(/\s/)) ? ("\"" + cmd.replace(/\"/g, '\\"') + "\"") : cmd;
    }));
    return commands.join(" ");
  },
  configurable: true,
  enumerable: true,
  writable: true
}), $__2), {}, Command);
function init(cli) {
  return (new Cmd('info', cli)).addOption(['--colored', '-C'], {default: true});
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=info.js.map