module.exports = function() {
  "use strict";
  var __moduleName = "src/cmds/agent";
  var $__2 = require('azk'),
      _ = $__2._,
      fs = $__2.fs,
      config = $__2.config,
      async = $__2.async,
      set_config = $__2.set_config,
      dynamic = $__2.dynamic;
  var $__2 = require('azk/cli/command'),
      Command = $__2.Command,
      Helpers = $__2.Helpers;
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
  ($traceurRuntime.createClass)(Cmd, {
    action: function(opts) {
      var progress = Helpers.vmStartProgress(this);
      return async(this, function() {
        var status,
            cmd_vm,
            promise;
        return $traceurRuntime.generatorWrap(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.state = (opts.action === 'start') ? 1 : 12;
                break;
              case 1:
                $ctx.state = 2;
                return Client.status();
              case 2:
                status = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                $ctx.state = (!status.agent) ? 5 : 12;
                break;
              case 5:
                $ctx.state = 6;
                return this.configure();
              case 6:
                opts.configs = $ctx.sent;
                $ctx.state = 8;
                break;
              case 8:
                $ctx.state = (config('agent:requires_vm') && opts['reload-vm']) ? 13 : 12;
                break;
              case 13:
                cmd_vm = this.parent.commands.vm;
                $ctx.state = 14;
                break;
              case 14:
                $ctx.state = 10;
                return cmd_vm.action({
                  action: 'remove',
                  fail: (function() {})
                });
              case 10:
                $ctx.maybeThrow();
                $ctx.state = 12;
                break;
              case 12:
                promise = Client[opts.action](opts).progress(progress);
                $ctx.state = 21;
                break;
              case 21:
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
    },
    configure: function() {
      var $__0 = this;
      this.warning('status.agent.wait');
      var conf = new Configure(this);
      this.ok('configure.loading_checking');
      return conf.run().then((function(configs) {
        $__0.ok('configure.loaded');
        return configs;
      }));
    }
  }, {}, Command);
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