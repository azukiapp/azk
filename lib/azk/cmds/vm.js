"use strict";
var __moduleName = "src/cmds/vm";
var $__2 = require('azk'),
    Q = $__2.Q,
    _ = $__2._,
    config = $__2.config,
    async = $__2.async,
    t = $__2.t;
var $__2 = require('azk/cli/command'),
    Command = $__2.Command,
    Helpers = $__2.Helpers;
var Server = require('azk/agent/server').Server;
var VM = require('azk/agent/vm').VM;
var net = require('azk/utils').net;
var RequiredError = function RequiredError(key) {
  this.key = key;
};
($traceurRuntime.createClass)(RequiredError, {}, {}, Error);
var VmCmd = function VmCmd() {
  $traceurRuntime.defaultSuperCall(this, $VmCmd.prototype, arguments);
};
var $VmCmd = VmCmd;
($traceurRuntime.createClass)(VmCmd, {
  require_installed: function(vm_info) {
    if (!vm_info.installed) {
      throw new RequiredError("commands.vm.not_installed");
    }
  },
  require_running: function(vm_info) {
    this.require_installed(vm_info);
    if (!vm_info.running) {
      throw new RequiredError("commands.vm.not_runnig");
    }
  },
  action: function(opts) {
    if (!config('agent:requires_vm')) {
      this.fail('commands.vm.not_requires');
      return 1;
    }
    return async(this, function() {
      var $__0,
          action,
          vm_name,
          vm_info,
          promise;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__0 = this;
              action = opts.action;
              vm_name = config("agent:vm:name");
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 2;
              return VM.info(vm_name);
            case 2:
              vm_info = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              promise = this[("action_" + action)](vm_info);
              promise = promise.progress(Helpers.vmStartProgress(this));
              $ctx.state = 10;
              break;
            case 10:
              $ctx.returnValue = promise.fail(opts.fail || ((function(error) {
                if (error instanceof RequiredError) {
                  $__0.fail(error.key);
                  return 1;
                }
                throw error;
              })));
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  action_start: function(vm_info) {
    return async(this, function() {
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = (vm_info.running) ? 3 : 2;
              break;
            case 3:
              this.fail("commands.vm.already_running");
              $ctx.state = 4;
              break;
            case 4:
              $ctx.returnValue = 1;
              $ctx.state = -2;
              break;
            case 2:
              this.require_installed(vm_info);
              $ctx.state = 11;
              break;
            case 11:
              $ctx.state = 7;
              return Server.installVM(true, false);
            case 7:
              $ctx.maybeThrow();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  action_stop: function(vm_info) {
    return async(this, function() {
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              this.require_running(vm_info);
              $ctx.state = 6;
              break;
            case 6:
              $ctx.state = 2;
              return VM.stop(vm_info.name);
            case 2:
              $ctx.maybeThrow();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  action_status: function(vm_info) {
    return async(this, function() {
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              this.require_running(vm_info);
              this.ok("commands.vm.running");
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  action_installed: function(vm_info) {
    return async(this, function() {
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              this.require_installed(vm_info);
              this.ok("commands.vm.already");
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  action_install: function(vm_info) {
    return async(this, function() {
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              if (vm_info.installed) {
                throw new RequiredError("commands.vm.already");
              }
              $ctx.state = 6;
              break;
            case 6:
              $ctx.state = 2;
              return Server.installVM(false, false);
            case 2:
              $ctx.maybeThrow();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  action_remove: function(vm_info) {
    return async(this, function() {
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              this.require_installed(vm_info);
              $ctx.state = 11;
              break;
            case 11:
              $ctx.state = (vm_info.running) ? 1 : 4;
              break;
            case 1:
              $ctx.state = 2;
              return VM.stop(vm_info.name);
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = 7;
              return VM.remove(vm_info.name);
            case 7:
              $ctx.maybeThrow();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  action_reload: function(vm_info) {
    return async(this, function() {
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              this.require_installed(vm_info);
              $ctx.state = 15;
              break;
            case 15:
              $ctx.state = 2;
              return this.action_remove(vm_info);
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = 6;
              return this.action_install({installed: false});
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = (vm_info.running) ? 9 : -2;
              break;
            case 9:
              $ctx.state = 10;
              return this.action_start({
                installed: true,
                name: vm_info.name
              });
            case 10:
              $ctx.maybeThrow();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  }
}, {}, Command);
function init(cli) {
  if (config('agent:requires_vm')) {
    (new VmCmd('vm {action}', cli)).setOptions('action', {options: ['install', 'installed', 'start', 'status', 'stop', 'remove', 'reload']});
  }
}
module.exports = {
  get init() {
    return init;
  },
  __esModule: true
};
//# sourceMappingURL=vm.js.map