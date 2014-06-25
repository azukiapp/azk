"use strict";
var __moduleName = "src/cmds/up";
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
var Cmd = function Cmd() {
  $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
};
var $Cmd = Cmd;
($traceurRuntime.createClass)(Cmd, {action: function(opts) {
    return async(this, function() {
      var manifest;
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
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  }}, {}, Command);
function init(cli) {
  return new Cmd('up', cli);
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=up.js.map