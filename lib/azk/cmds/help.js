"use strict";
var __moduleName = "src/cmds/help";
var $__1 = require('azk'),
    Q = $__1.Q,
    _ = $__1._,
    config = $__1.config,
    t = $__1.t;
var $__1 = require('azk/cli/command'),
    Command = $__1.Command,
    Helpers = $__1.Helpers;
var docker = require('azk/docker').default;
var HelpCmd = function HelpCmd() {
  $traceurRuntime.defaultSuperCall(this, $HelpCmd.prototype, arguments);
};
var $HelpCmd = HelpCmd;
($traceurRuntime.createClass)(HelpCmd, {action: function(opts) {
    this.parent.showUsage(opts.command);
    return 0;
  }}, {}, Command);
function init(cli) {
  (new HelpCmd('help [command]', cli));
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=help.js.map