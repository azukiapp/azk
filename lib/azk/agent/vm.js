"use strict";
var __moduleName = "src/agent/vm";
var $__2 = require('azk'),
    _ = $__2._,
    Q = $__2.Q,
    config = $__2.config,
    defer = $__2.defer,
    async = $__2.async,
    t = $__2.t,
    log = $__2.log;
var Utils = require('azk/utils').default;
var Tools = require('azk/agent/tools').Tools;
var SSH = require('azk/agent/ssh').SSH;
var vbm = require('vboxmanage');
var qfs = require('q-io/fs');
var os = require('os');
var machine = Utils.qifyModule(vbm.machine);
var instance = Utils.qifyModule(vbm.instance);
var hostonly = Utils.qifyModule(vbm.hostonly);
var dhcp = Utils.qifyModule(vbm.dhcp);
var _exec = Q.nbind(vbm.command.exec, vbm.command);
function exec() {
  for (var args = [],
      $__0 = 0; $__0 < arguments.length; $__0++)
    args[$__0] = arguments[$__0];
  return _exec.apply(null, $traceurRuntime.toObject(args)).then((function(result) {
    if (result[0] != 0) {
      result[1] = "command: " + args.join(' ') + "\n\n" + result[1];
      throw new Error(result[1]);
    }
    return result[1];
  }));
}
function modifyvm(name) {
  for (var options = [],
      $__1 = 1; $__1 < arguments.length; $__1++)
    options[$__1 - 1] = arguments[$__1];
  return exec.apply(null, $traceurRuntime.spread(["modifyvm", name], options));
}
var hdds = {
  list: function() {
    return exec("list", "hdds").then((function(output) {
      return vbm.parse.linebreak_list(output);
    }));
  },
  close: function(file, remove) {
    var args = ["closemedium", "disk", file];
    if (remove) {
      args.push("--delete");
    }
    return exec.apply(null, args);
  },
  clonehd: function(origin, target) {
    var self = this;
    return exec("clonehd", origin, target).then(hdds.list).then((function(hdds) {
      var closes = [];
      _.each(hdds, (function(hdd) {
        if (_.contains([origin, target], hdd.Location)) {
          closes.push(self.close(hdd.Location), hdd.Location == origin);
        }
      }));
      return Q.all(closes);
    }));
  }
};
function config_nat_interface(name) {
  var replace = arguments[1] !== (void 0) ? arguments[1] : false;
  return async(function() {
    var ssh_port,
        ssh_natpf;
    return $traceurRuntime.generatorWrap(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.state = 2;
            return Utils.net.getPort();
          case 2:
            ssh_port = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            ssh_natpf = ["--natpf2", "ssh,tcp,127.0.0.1," + ssh_port + ",,22"];
            $ctx.state = 19;
            break;
          case 19:
            $ctx.state = (replace) ? 5 : 13;
            break;
          case 5:
            $ctx.state = 6;
            return modifyvm(name, ["--natpf2", "delete", "ssh"]);
          case 6:
            $ctx.maybeThrow();
            $ctx.state = 8;
            break;
          case 8:
            $ctx.state = 10;
            return modifyvm(name, ssh_natpf);
          case 10:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          case 13:
            $ctx.state = 14;
            return modifyvm(name, $traceurRuntime.spread(["--nic2", "nat", "--nictype2", "virtio", "--cableconnected2", "on"], ssh_natpf));
          case 14:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, this);
  });
}
function config_dhcp(net, getway, net_mask, ip) {
  return async(function() {
    var lower_ip,
        upper_ip;
    return $traceurRuntime.generatorWrap(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            lower_ip = ip;
            upper_ip = ip;
            $ctx.state = 10;
            break;
          case 10:
            $ctx.state = 2;
            return dhcp.ensure_hostonly_server(net, getway, net_mask, lower_ip, upper_ip);
          case 2:
            $ctx.maybeThrow();
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = 6;
            return dhcp.enable_hostonly_server(net);
          case 6:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, this);
  });
}
function config_net_interfaces(name, ip) {
  var nat_name = "azk-nat-network";
  return async(function() {
    var result,
        inter,
        getway,
        net_mask;
    return $traceurRuntime.generatorWrap(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.state = 2;
            return exec("hostonlyif", "create");
          case 2:
            result = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            inter = result.match(/Interface '(.*)?'/)[1];
            $ctx.state = 22;
            break;
          case 22:
            $ctx.state = 6;
            return modifyvm(name, ["--nic1", "hostonly", "--nictype1", "virtio", "--cableconnected1", "on", "--hostonlyadapter1", inter]);
          case 6:
            $ctx.maybeThrow();
            $ctx.state = 8;
            break;
          case 8:
            getway = Utils.net.calculateGatewayIp(ip);
            net_mask = "255.255.255.0";
            $ctx.state = 24;
            break;
          case 24:
            $ctx.state = 10;
            return config_nat_interface(name);
          case 10:
            $ctx.maybeThrow();
            $ctx.state = 12;
            break;
          case 12:
            $ctx.state = 14;
            return hostonly.configure_if(inter, getway, net_mask);
          case 14:
            $ctx.maybeThrow();
            $ctx.state = 16;
            break;
          case 16:
            $ctx.state = 18;
            return config_dhcp(inter, getway, net_mask, ip);
          case 18:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, this);
  });
}
function config_disks(name, boot, data) {
  var storage_opts = ["storagectl", name, "--name", "SATA", "--add", "sata", "--hostiocache", "on"];
  var storage_boot = ["storageattach", name, "--storagectl", "SATA", "--port", "0", "--device", "0", "--type", "dvddrive", "--medium", boot];
  var storage_data = ["storageattach", name, "--storagectl", "SATA", "--port", "1", "--device", "0", "--type", "hdd", "--medium", data];
  return async(function() {
    var file,
        $__3,
        $__4,
        $__5;
    return $traceurRuntime.generatorWrap(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $__3 = qfs.exists;
            $__4 = $__3.call(qfs, data);
            $ctx.state = 6;
            break;
          case 6:
            $ctx.state = 2;
            return $__4;
          case 2:
            $__5 = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = (!$__5) ? 15 : 14;
            break;
          case 15:
            file = data + ".tmp";
            $ctx.state = 16;
            break;
          case 16:
            $ctx.state = 8;
            return Utils.unzip(config("agent:vm:blank_disk"), file);
          case 8:
            $ctx.maybeThrow();
            $ctx.state = 10;
            break;
          case 10:
            $ctx.state = 12;
            return hdds.clonehd(file, data);
          case 12:
            $ctx.maybeThrow();
            $ctx.state = 14;
            break;
          case 14:
            $ctx.state = 19;
            return exec.apply(null, storage_opts);
          case 19:
            $ctx.maybeThrow();
            $ctx.state = 21;
            break;
          case 21:
            $ctx.state = 23;
            return exec.apply(null, storage_boot);
          case 23:
            $ctx.maybeThrow();
            $ctx.state = 25;
            break;
          case 25:
            $ctx.state = 27;
            return exec.apply(null, storage_data);
          case 27:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, this);
  });
}
function acpipowerbutton(name) {
  return exec('controlvm', name, 'acpipowerbutton');
}
var vm = {
  info: function(vm_name) {
    return machine.info(vm_name).then((function(info) {
      if (info['Forwarding(0)']) {
        var port = info['Forwarding(0)'].replace(/ssh,tcp,127.0.0.1,(.*),,22/, '$1');
        if (port) {
          info.ssh_port = port;
        }
      }
      return _.merge(info, {
        installed: true,
        running: info.VMState == "running"
      });
      ;
    }), (function(err) {
      if (err.message.match(/cannot show vm info/))
        return {
          installed: false,
          running: false
        };
      throw err;
    }));
  },
  init: function(opts) {
    return Tools.async_status("vm", this, function(status_change) {
      var name,
          cmd,
          usage,
          $__6,
          $__7,
          $__8,
          $__9,
          $__10,
          $__11;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              name = opts.name;
              $ctx.state = 39;
              break;
            case 39:
              $__6 = this.isInstalled;
              $__7 = $__6.call(this, name);
              $ctx.state = 6;
              break;
            case 6:
              $ctx.state = 2;
              return $__7;
            case 2:
              $__8 = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = ($__8) ? 7 : 8;
              break;
            case 7:
              $ctx.returnValue = false;
              $ctx.state = -2;
              break;
            case 8:
              status_change("installing");
              $ctx.state = 41;
              break;
            case 41:
              $ctx.state = 11;
              return exec("createvm", "--name", name, "--register");
            case 11:
              $ctx.maybeThrow();
              $ctx.state = 13;
              break;
            case 13:
              cmd = ["--ostype", "Linux26_64", "--cpus", config("agent:vm:cpus"), "--memory", config("agent:vm:memory"), "--vram", "9", "--rtcuseutc", "on", "--acpi", "on", "--ioapic", "on", "--hpet", "on", "--hwvirtex", "on", "--vtxvpid", "on", "--largepages", "on", "--nestedpaging", "on", "--firmware", "bios", "--bioslogofadein", "off", "--bioslogofadeout", "off", "--bioslogodisplaytime", "0", "--biosbootmenu", "disabled", "--boot1", "dvd"];
              $ctx.state = 43;
              break;
            case 43:
              $ctx.state = 15;
              return Q.nfcall(vbm.command.exec, "modifyvm");
            case 15:
              usage = $ctx.sent;
              $ctx.state = 17;
              break;
            case 17:
              if (usage.join("\n").match(/--vtxux/)) {
                cmd.push('--vtxux', 'on');
              }
              $ctx.state = 45;
              break;
            case 45:
              $ctx.state = 19;
              return modifyvm(name, cmd);
            case 19:
              $ctx.maybeThrow();
              $ctx.state = 21;
              break;
            case 21:
              $ctx.state = 23;
              return config_net_interfaces(name, opts.ip);
            case 23:
              $ctx.maybeThrow();
              $ctx.state = 25;
              break;
            case 25:
              $ctx.state = 27;
              return config_disks(name, opts.boot, opts.data);
            case 27:
              $ctx.maybeThrow();
              $ctx.state = 29;
              break;
            case 29:
              status_change("installed");
              $ctx.state = 47;
              break;
            case 47:
              $__9 = this.info;
              $__10 = $__9.call(this, name);
              $ctx.state = 35;
              break;
            case 35:
              $ctx.state = 31;
              return $__10;
            case 31:
              $__11 = $ctx.sent;
              $ctx.state = 33;
              break;
            case 33:
              $ctx.returnValue = $__11;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  isInstalled: function(vm_name) {
    return this.info(vm_name).then((function(status) {
      return status.installed;
    }));
  },
  isRunnig: function(vm_name) {
    return this.info(vm_name).then((function(status) {
      return status.running;
    }));
  },
  start: function(vm_name) {
    log.debug("call to start vm %s", vm_name);
    return Tools.async_status("vm", this, function(status_change) {
      var info;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return vm.info(vm_name);
            case 2:
              info = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (info.installed && !(info.running)) ? 11 : 10;
              break;
            case 11:
              status_change("starting");
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 6;
              return config_nat_interface(vm_name, true);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              $ctx.returnValue = instance.start(vm_name).then((function() {
                status_change("started");
                return true;
              }));
              $ctx.state = -2;
              break;
            case 10:
              $ctx.returnValue = false;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  stop: function(vm_name) {
    var force = arguments[1] !== (void 0) ? arguments[1] : false;
    log.debug("call to stop vm %s", vm_name);
    return Tools.async_status("vm", this, function(status_change) {
      var info;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return vm.info(vm_name);
            case 2:
              info = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (info.running) ? 24 : 23;
              break;
            case 24:
              status_change("stoping");
              $ctx.state = 25;
              break;
            case 25:
              $ctx.state = (force) ? 5 : 9;
              break;
            case 5:
              $ctx.state = 6;
              return instance.stop(vm_name);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 9:
              $ctx.state = 10;
              return acpipowerbutton(vm_name);
            case 10:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = (true) ? 14 : 21;
              break;
            case 14:
              $ctx.state = 15;
              return this.info(vm_name);
            case 15:
              info = $ctx.sent;
              $ctx.state = 17;
              break;
            case 17:
              $ctx.state = (!info.running) ? 21 : 8;
              break;
            case 21:
              status_change("stoped");
              $ctx.state = 27;
              break;
            case 27:
              $ctx.returnValue = true;
              $ctx.state = -2;
              break;
            case 23:
              $ctx.returnValue = false;
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  remove: function(vm_name) {
    return Tools.async_status("vm", this, function(status_change) {
      var info,
          fail;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return vm.info(vm_name);
            case 2:
              info = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (info.name == vm_name) ? 27 : -2;
              break;
            case 27:
              fail = (function(error) {
                status_change("error", error.stack || error);
              });
              status_change("removing");
              $ctx.state = 28;
              break;
            case 28:
              $ctx.state = (typeof(info['SATA-1-0']) != 'undefined') ? 5 : 12;
              break;
            case 5:
              $ctx.state = 6;
              return exec("storagectl", vm_name, "--name", "SATA", "--remove").fail(fail);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = 10;
              return exec("closemedium", "disk", info['SATA-1-0']).fail(fail);
            case 10:
              $ctx.maybeThrow();
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 15;
              return machine.remove(vm_name).fail(fail);
            case 15:
              $ctx.maybeThrow();
              $ctx.state = 17;
              break;
            case 17:
              $ctx.state = (info.nic1 != null) ? 18 : 25;
              break;
            case 18:
              $ctx.state = 19;
              return dhcp.remove_hostonly_server(info.hostonlyadapter1).fail(fail);
            case 19:
              $ctx.maybeThrow();
              $ctx.state = 21;
              break;
            case 21:
              $ctx.state = 23;
              return hostonly.remove_if(info.hostonlyadapter1).fail(fail);
            case 23:
              $ctx.maybeThrow();
              $ctx.state = 25;
              break;
            case 25:
              status_change("removed");
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  make_ssh: function(vm_name) {
    return async(this, function() {
      var info;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return this.info(vm_name);
            case 2:
              info = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              $ctx.state = (info.running) ? 5 : 7;
              break;
            case 5:
              $ctx.returnValue = new SSH('127.0.0.1', info.ssh_port);
              $ctx.state = -2;
              break;
            case 7:
              throw new Error("vm is not running");
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  ssh: function(name, cmd) {
    var wait = arguments[2] !== (void 0) ? arguments[2] : false;
    return this.make_ssh(name).then((function(ssh) {
      return ssh.exec(cmd, wait);
    }));
  },
  copyFile: function(name, origin, target) {
    return this.make_ssh(name).then((function(ssh) {
      return ssh.putFile(origin, target);
    }));
  }
};
;
module.exports = {
  get VM() {
    return vm;
  },
  __esModule: true
};
//# sourceMappingURL=vm.js.map