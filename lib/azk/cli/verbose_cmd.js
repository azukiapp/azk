"use strict";
var __moduleName = "src/cli/verbose_cmd";
var Command = require('azk/cli/command').Command;
var VerboseCmd = function VerboseCmd() {
  for (var args = [],
      $__1 = 0; $__1 < arguments.length; $__1++)
    args[$__1] = arguments[$__1];
  this._verbose_nivel = 0;
  $traceurRuntime.superCall(this, $VerboseCmd.prototype, "constructor", $traceurRuntime.spread(args));
  this.addOption(['--verbose', '-v'], {
    default: false,
    acc: true
  });
};
var $VerboseCmd = VerboseCmd;
($traceurRuntime.createClass)(VerboseCmd, {
  before_action: function(opts) {
    for (var args = [],
        $__2 = 1; $__2 < arguments.length; $__2++)
      args[$__2 - 1] = arguments[$__2];
    this._verbose_nivel = opts.verbose;
    return $traceurRuntime.superCall(this, $VerboseCmd.prototype, "before_action", $traceurRuntime.spread([opts], args));
  },
  verbose: function() {
    for (var args = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      args[$__3] = arguments[$__3];
    return null;
  },
  verbose_msg: function(nivel, func) {
    var $__6;
    for (var args = [],
        $__4 = 2; $__4 < arguments.length; $__4++)
      args[$__4 - 2] = arguments[$__4];
    if (nivel <= this._verbose_nivel) {
      if (typeof(func) == "function") {
        return func.apply(null, $traceurRuntime.toObject(args));
      } else {
        return ($__6 = this).verbose.apply($__6, $traceurRuntime.spread([func], args));
      }
    }
  }
}, {}, Command);
module.exports = {
  get VerboseCmd() {
    return VerboseCmd;
  },
  __esModule: true
};
//# sourceMappingURL=verbose_cmd.js.map