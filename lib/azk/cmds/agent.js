"use strict";
var __moduleName = "src/cmds/agent";
var $__1 = require('azk'),
    _ = $__1._,
    fs = $__1.fs,
    config = $__1.config,
    async = $__1.async,
    set_config = $__1.set_config;
var $__1 = require('azk/cli/command'),
    Command = $__1.Command,
    Helpers = $__1.Helpers;
var AGENT_CODE_ERROR = require('azk/utils/errors').AGENT_CODE_ERROR;
var VM = require('azk/agent/vm').VM;
var net = require('net');
var Cmd = function Cmd() {
  $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
};
var $Cmd = Cmd;
($traceurRuntime.createClass)(Cmd, {action: function(opts) {
    var Client = require('azk/agent/client').Client;
    var progress = Helpers.vmStartProgress(this);
    return async(this, function() {
      var cmd_vm,
          promise;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = (opts['reload-vm'] && opts.action == "start") ? 5 : 4;
              break;
            case 5:
              cmd_vm = this.parent.commands.vm;
              $ctx.state = 6;
              break;
            case 6:
              $ctx.state = 2;
              return cmd_vm.action({
                action: 'remove',
                fail: (function() {})
              });
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              promise = Client[opts.action](opts).progress(progress);
              $ctx.state = 11;
              break;
            case 11:
              $ctx.returnValue = promise.then((function(result) {
                if (opts.action != "status")
                  return result;
                return (result.agent) ? 0 : 1;
              }));
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  }}, {}, Command);
function init(cli) {
  var cli = (new Cmd('agent {action}', cli)).setOptions('action', {options: ['start', 'status', 'stop']}).addOption(['--daemon', '-d'], {default: true});
  if (config('agent:requires_vm')) {
    cli.addOption(['--reload-vm', '-d'], {default: true});
  }
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=agent.js.map