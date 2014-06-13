"use strict";
var __moduleName = "src/agent/unfsd";
var $__1 = require('azk'),
    Q = $__1.Q,
    fs = $__1.fs,
    config = $__1.config,
    log = $__1.log,
    defer = $__1.defer;
var net = require('azk/utils').net;
var VM = require('azk/agent/vm').VM;
var Tools = require('azk/agent/tools').Tools;
var forever = require('forever-monitor');
var Unfsd = {
  child: null,
  port: null,
  ip: null,
  start: function() {
    return Tools.async_status("unsfd", this, function(change_status) {
      var $__0,
          port,
          file,
          args,
          $__2,
          $__3,
          $__4;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__0 = this;
              $ctx.state = 15;
              break;
            case 15:
              $ctx.state = (this.isRunnig()) ? 1 : 2;
              break;
            case 1:
              $ctx.state = -2;
              break;
            case 2:
              $__2 = net.getPort;
              $__3 = $__2.call(net);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = 5;
              return $__3;
            case 5:
              $__4 = $ctx.sent;
              $ctx.state = 7;
              break;
            case 7:
              this.port = $__4;
              port = $__4;
              $ctx.state = 11;
              break;
            case 11:
              file = this.__checkConfig();
              args = [config("paths:unfsd"), "-s", "-d", "-p", "-t", "-n", port, "-m", port, "-e", file];
              $ctx.state = 17;
              break;
            case 17:
              $ctx.returnValue = defer((function(resolve, reject) {
                change_status("starting");
                $__0.child = forever.start(args, {
                  max: 5,
                  silent: true,
                  pidFile: config("paths:unfsd_pid")
                });
                $__0.child.on('start', (function() {
                  change_status("started", {
                    port: port,
                    file: file
                  });
                  resolve();
                }));
              }));
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  stop: function() {
    var $__0 = this;
    return Tools.defer_status("unsfd", (function(resolve, _reject, change_status) {
      log.debug("call to stop unsfd");
      if ($__0.child) {
        $__0.child.on('stop', (function() {
          change_status("stoped");
          resolve();
        }));
        change_status("stopping");
        $__0.child.stop();
      } else {
        resolve();
      }
    }));
  },
  mount: function(vm_name) {
    var $__0 = this;
    return Tools.defer_status("unsfd", (function(_resolve, _reject, change_status) {
      var point = config('agent:vm:mount_point');
      var ip = net.calculateGatewayIp(config("agent:vm:ip"));
      var opts = [("port=" + $__0.port), ("mountport=" + $__0.port), 'mountvers=3', 'nfsvers=3', 'nolock', 'tcp'];
      var mount = ("sudo mount -o " + opts.join(',') + " " + ip + ":/ " + point);
      var check = ("mount | grep " + point + " &>/dev/null");
      var cmd = [("[ -d \"" + point + "\" ] || { mkdir -p " + point + "; }"), "{ " + check + " || " + mount + "; }", "{ " + check + "; }"].join("; ");
      var stderr = "";
      var progress = (function(event) {
        if (event.type == "ssh" && event.context == "stderr") {
          stderr += event.data.toString();
        }
        return event;
      });
      change_status("mounting");
      return VM.ssh(vm_name, cmd).progress(progress).then((function(code) {
        if (code != 0)
          throw new Error('not mount share files, error:\n' + stderr);
        change_status("mounted");
      }));
    }));
  },
  isRunnig: function() {
    return (this.child && this.child.running);
  },
  __checkConfig: function() {
    var file = config('paths:unfsd_file');
    fs.writeFileSync(file, ["# All", "/ " + net.calculateNetIp(config("agent:vm:ip")) + "(rw)"].join("\n"));
    return file;
  }
};
;
module.exports = {
  get Unfsd() {
    return Unfsd;
  },
  __esModule: true
};
//# sourceMappingURL=unfsd.js.map