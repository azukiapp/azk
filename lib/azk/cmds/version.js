"use strict";
var __moduleName = "src/cmds/version";
var Command = require('azk/cli/command').Command;
var Azk = require('azk').default;
var HelpCmd = function HelpCmd() {
  $traceurRuntime.defaultSuperCall(this, $HelpCmd.prototype, arguments);
};
var $HelpCmd = HelpCmd;
($traceurRuntime.createClass)(HelpCmd, {action: function(opts) {
    this.output("Azk %s", Azk.version);
    return 0;
  }}, {}, Command);
function init(cli) {
  (new HelpCmd('version', cli));
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=version.js.map