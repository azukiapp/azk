"use strict";
var __moduleName = "src/cmds/configs";
var $__2 = require('azk'),
    _ = $__2._,
    config = $__2.config;
var Command = require('azk/cli/command').Command;
var Cmd = function Cmd() {
  $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
};
var $Cmd = Cmd;
($traceurRuntime.createClass)(Cmd, {action: function(opts) {
    var $__0 = this;
    var configs = {
      docker_url: config('docker:host'),
      vm_ip: config('agent:vm:ip')
    };
    _.each(configs, (function(value, key) {
      $__0.output((key + ": " + value));
    }));
  }}, {}, Command);
function init(cli) {
  (new Cmd('configs [path]', cli));
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=configs.js.map