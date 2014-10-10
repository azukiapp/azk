module.exports = function() {
  "use strict";
  var __moduleName = "src/cmds/agent";
  var $__1 = require('azk'),
      _ = $__1._,
      fs = $__1.fs,
      config = $__1.config,
      async = $__1.async,
      set_config = $__1.set_config,
      dynamic = $__1.dynamic;
  var $__1 = require('azk/cli/command'),
      Command = $__1.Command,
      Helpers = $__1.Helpers;
  var AGENT_CODE_ERROR = require('azk/utils/errors').AGENT_CODE_ERROR;
  dynamic(this, {
    Client: function() {
      return require('azk/agent/client').Client;
    },
    Configure: function() {
      return require('azk/agent/configure').Configure;
    }
  });
  var Cmd = function Cmd() {
    $traceurRuntime.defaultSuperCall(this, $Cmd.prototype, arguments);
  };
  var $Cmd = Cmd;
  ($traceurRuntime.createClass)(Cmd, {action: function(opts) {
      var progress = Helpers.vmStartProgress(this);
      return async(this, function() {
        var cmd_vm,
            status,
            conf,
            promise;
        return $traceurRuntime.generatorWrap(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.state = (config('agent:requires_vm')) ? 7 : 4;
                break;
              case 7:
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
                $ctx.state = 10;
                return Client.status();
              case 10:
                status = $ctx.sent;
                $ctx.state = 12;
                break;
              case 12:
                $ctx.state = (opts.action == 'start' && !status.agent) ? 17 : 20;
                break;
              case 17:
                this.warning('status.agent.wait');
                conf = new Configure(this);
                this.ok('configure.loading_checking');
                $ctx.state = 18;
                break;
              case 18:
                $ctx.state = 14;
                return conf.run();
              case 14:
                conf = $ctx.sent;
                $ctx.state = 16;
                break;
              case 16:
                this.ok('configure.loaded');
                $ctx.state = 20;
                break;
              case 20:
                promise = Client[opts.action](opts).progress(progress);
                $ctx.state = 25;
                break;
              case 25:
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
  return {
    get init() {
      return init;
    },
    __esModule: true
  };
}.call(typeof global !== 'undefined' ? global : this);
//# sourceMappingURL=agent.js.map