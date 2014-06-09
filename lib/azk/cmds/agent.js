"use strict";
var __moduleName = "src/cmds/agent";
var $__1 = require('azk'),
    Q = $__1.Q,
    _ = $__1._,
    config = $__1.config,
    set_config = $__1.set_config;
var $__1 = require('azk/cli/command'),
    Command = $__1.Command,
    Helpers = $__1.Helpers;
var Cmd = function Cmd() {
  $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
};
var $Cmd = Cmd;
($traceurRuntime.createClass)(Cmd, {action: function(opts) {
    var Client = require('azk/agent/client').Client;
    var progress = Helpers.vmStartProgress(this);
    var promise = Client[opts.action](opts).progress(progress);
    return promise.then((function(result) {
      if (opts.action != "status")
        return result;
      return (result.agent) ? 0 : 1;
    }));
  }}, {}, Command);
function init(cli) {
  (new Cmd('agent {action}', cli)).setOptions('action', {options: ['start', 'status', 'stop']}).addOption(['--daemon', '-d'], {default: false});
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=agent.js.map