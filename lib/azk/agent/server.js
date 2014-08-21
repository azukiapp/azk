"use strict";
var __moduleName = "src/agent/server";
var $__0 = require('azk'),
    config = $__0.config,
    defer = $__0.defer,
    async = $__0.async,
    t = $__0.t,
    log = $__0.log;
var VM = require('azk/agent/vm').VM;
var Unfsd = require('azk/agent/unfsd').Unfsd;
var Balancer = require('azk/agent/balancer').Balancer;
var net_utils = require('azk/utils').net;
var AgentStartError = require('azk/utils/errors').AgentStartError;
var Server = {
  server: null,
  start: function() {
    return async(this, function() {
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              log.info_t("commands.agent.starting");
              $ctx.state = 19;
              break;
            case 19:
              $ctx.state = (config('agent:requires_vm')) ? 1 : 12;
              break;
            case 1:
              $ctx.state = 2;
              return this.installShare();
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = 6;
              return this.installVM(true);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 10;
              return this.mountShare();
            case 10:
              $ctx.maybeThrow();
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 15;
              return this.installBalancer();
            case 15:
              $ctx.maybeThrow();
              $ctx.state = 17;
              break;
            case 17:
              log.info_t("commands.agent.started");
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  stop: function() {
    return async(this, function() {
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return this.removeBalancer();
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (config('agent:requires_vm')) ? 5 : -2;
              break;
            case 5:
              $ctx.state = 6;
              return this.stopVM();
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 10;
              return this.removeShare();
            case 10:
              $ctx.maybeThrow();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  installBalancer: function() {
    return Balancer.start();
  },
  removeBalancer: function() {
    return Balancer.stop();
  },
  installShare: function() {
    return Unfsd.start();
  },
  removeShare: function() {
    return Unfsd.stop();
  },
  mountShare: function() {
    return Unfsd.mount(config("agent:vm:name"));
  },
  installVM: function() {
    var start = arguments[0] !== (void 0) ? arguments[0] : false;
    var vm_name = config("agent:vm:name");
    return async(this, function(notify) {
      var installed,
          running,
          opts,
          n,
          address,
          success,
          key,
          authoried,
          $__1,
          $__2,
          $__3,
          $__4;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return VM.isInstalled(vm_name);
            case 2:
              installed = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = ((installed)) ? 9 : 13;
              break;
            case 9:
              $__1 = VM.isRunnig;
              $__2 = $__1.call(VM, vm_name);
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = 6;
              return $__2;
            case 6:
              $__3 = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              $__4 = $__3;
              $ctx.state = 12;
              break;
            case 13:
              $__4 = false;
              $ctx.state = 12;
              break;
            case 12:
              running = $__4;
              $ctx.state = 17;
              break;
            case 17:
              $ctx.state = (!installed) ? 22 : 21;
              break;
            case 22:
              opts = {
                name: vm_name,
                ip: config("agent:vm:ip"),
                boot: config("agent:vm:boot_disk"),
                data: config("agent:vm:data_disk")
              };
              $ctx.state = 23;
              break;
            case 23:
              $ctx.state = 19;
              return VM.init(opts);
            case 19:
              $ctx.maybeThrow();
              $ctx.state = 21;
              break;
            case 21:
              $ctx.state = (!running && start) ? 25 : 36;
              break;
            case 25:
              $ctx.state = 26;
              return VM.start(vm_name);
            case 26:
              $ctx.maybeThrow();
              $ctx.state = 28;
              break;
            case 28:
              n = (function(status) {
                return notify({
                  type: "status",
                  context: "vm",
                  status: status
                });
              });
              n("wait");
              address = ("tcp://" + config("agent:vm:ip") + ":22");
              $ctx.state = 38;
              break;
            case 38:
              $ctx.state = 30;
              return net_utils.waitService(address, 10, {context: "vm"});
            case 30:
              success = $ctx.sent;
              $ctx.state = 32;
              break;
            case 32:
              if (!success) {
                throw new AgentStartError(t("errors.not_vm_start"));
              }
              n("initialized");
              n("upkey");
              key = config('agent:vm:ssh_key') + '.pub';
              authoried = config('agent:vm:authorized_key');
              $ctx.state = 40;
              break;
            case 40:
              $ctx.state = 34;
              return VM.copyFile(vm_name, key, authoried);
            case 34:
              $ctx.maybeThrow();
              $ctx.state = 36;
              break;
            case 36:
              ;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  stopVM: function(running) {
    var vm_name = config("agent:vm:name");
    return async(function() {
      var $__5,
          $__6,
          $__7,
          $__8;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = ((running == null)) ? 5 : 9;
              break;
            case 5:
              $__5 = VM.isRunnig;
              $__6 = $__5.call(VM, vm_name);
              $ctx.state = 6;
              break;
            case 6:
              $ctx.state = 2;
              return $__6;
            case 2:
              $__7 = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $__8 = $__7;
              $ctx.state = 8;
              break;
            case 9:
              $__8 = false;
              $ctx.state = 8;
              break;
            case 8:
              running = $__8;
              $ctx.state = 13;
              break;
            case 13:
              $ctx.state = (running) ? 14 : -2;
              break;
            case 14:
              $ctx.state = 15;
              return VM.stop(vm_name);
            case 15:
              $ctx.maybeThrow();
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  }
};
;
module.exports = {
  get Server() {
    return Server;
  },
  __esModule: true
};
//# sourceMappingURL=server.js.map