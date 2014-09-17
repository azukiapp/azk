import { _, Q, config, defer, async, t, log } from 'azk';
import Utils from 'azk/utils';
import { Tools } from 'azk/agent/tools';
import { SSH } from 'azk/agent/ssh';

var vbm  = require('vboxmanage');
var qfs  = require('q-io/fs');
var os   = require('os');

var machine  = Utils.qifyModule(vbm.machine );
var instance = Utils.qifyModule(vbm.instance);
var hostonly = Utils.qifyModule(vbm.hostonly);
var dhcp     = Utils.qifyModule(vbm.dhcp    );
var _exec    = Q.nbind(vbm.command.exec, vbm.command);

function exec(...args) {
  return _exec(...args).then((result) => {
    if (result[0] != 0) {
      result[1] = "command: " + args.join(' ') + "\n\n" + result[1];
      throw new Error(result[1]);
    }
    return result[1];
  });
}

function modifyvm(name, ...options) {
  return exec("modifyvm", name, ...options);
}

var hdds = {
  list() {
    return exec("list", "hdds").then((output) => {
      return vbm.parse.linebreak_list(output);
    });
  },

  close(file, remove) {
    var args = ["closemedium", "disk", file];
    if (remove) { args.push("--delete"); }
    return exec.apply(null, args);
  },

  clonehd(origin, target) {
    var self = this;
    return exec("clonehd", origin, target)
      .then(hdds.list)
      .then((hdds) => {
        var closes = [];
        _.each(hdds, (hdd) => {
          if (_.contains([origin, target], hdd.Location)) {
            closes.push(self.close(hdd.Location), hdd.Location == origin);
          }
        });
        return Q.all(closes);
      });
  },
}

function config_nat_interface(name, replace = false) {
  return async(function* () {
    var ssh_port  = yield Utils.net.getPort();
    var ssh_natpf = ["--natpf2", "ssh,tcp,127.0.0.1," + ssh_port + ",,22"]

    if (replace) {
      // Remove and add
      yield modifyvm(name, ["--natpf2", "delete", "ssh"]);
      yield modifyvm(name, ssh_natpf);
    } else {
      yield modifyvm(name, [
        "--nic2", "nat",
        "--nictype2", "virtio",
        "--cableconnected2", "on",
        ...ssh_natpf
      ]);
    }
  });
}

function config_dhcp(net, getway, net_mask, ip) {
  return async(function* () {
    var lower_ip = ip;
    var upper_ip = ip;
    yield dhcp.ensure_hostonly_server(net, getway, net_mask, lower_ip, upper_ip);
    yield dhcp.enable_hostonly_server(net);
  });
}

function config_net_interfaces(name, ip) {
  var nat_name = "azk-nat-network";

  return async(function* () {
    var result = yield exec("hostonlyif", "create");
    var inter  = result.match(/Interface '(.*)?'/)[1];

    yield modifyvm(name, [
      "--nic1", "hostonly",
      "--nictype1", "virtio",
      "--cableconnected1", "on",
      "--hostonlyadapter1", inter
    ]);

    // Configure dhcp server
    var getway   = Utils.net.calculateGatewayIp(ip);
    var net_mask = "255.255.255.0";

    // nat interfance
    yield config_nat_interface(name);
    yield hostonly.configure_if(inter, getway, net_mask);
    yield config_dhcp(inter, getway, net_mask, ip);
  });
}

function config_disks(name, boot, data) {
  var storage_opts = [
    "storagectl"   , name  ,
    "--name"       , "SATA",
    "--add"        , "sata",
    "--hostiocache", "on"  ,
  ];

  var storage_boot = [
    "storageattach", name  ,
    "--storagectl" , "SATA",
    "--port"       , "0"   ,
    "--device"     , "0"   ,
    "--type"       , "dvddrive",
    "--medium"     , boot  ,
  ];

  var storage_data = [
    "storageattach", name  ,
    "--storagectl" , "SATA",
    "--port"       , "1"   ,
    "--device"     , "0"   ,
    "--type"       , "hdd" ,
    "--medium"     , data  ,
  ];

  return async(function* () {
    if (!(yield qfs.exists(data))) {
      var file = data + ".tmp";
      yield Utils.unzip(config("agent:vm:blank_disk"), file);
      yield hdds.clonehd(file, data);
    }

    yield exec.apply(null, storage_opts);
    yield exec.apply(null, storage_boot);
    yield exec.apply(null, storage_data);
  });
}

function acpipowerbutton(name) {
  return exec('controlvm', name, 'acpipowerbutton');
}

var vm = {
  info(vm_name) {
    return machine.info(vm_name).then((info) => {
      if (info['Forwarding(0)']) {
        var port = info['Forwarding(0)'].replace(/ssh,tcp,127.0.0.1,(.*),,22/, '$1');
        if (port) {
          info.ssh_port = port;
        }
      }
      return _.merge(info, { installed: true, running: info.VMState == "running" });;
    }, (err) => {
      if (err.message.match(/cannot show vm info/))
        return { installed: false, running: false };
      throw err;
    });
  },

  init(opts) {
    return Tools.async_status("vm", this, function* (status_change) {
      var name = opts.name;
      if (yield this.isInstalled(name))
        return false;

      status_change("installing");
      yield exec("createvm", "--name", name, "--register");

      var cmd = [
        "--ostype", "Linux26_64",
        "--cpus", config("agent:vm:cpus"),
        "--memory", config("agent:vm:memory"),
        "--vram", "9",
        "--rtcuseutc", "on",
        "--acpi", "on",
        "--ioapic", "on",
        "--hpet", "on",
        "--hwvirtex", "on",
        "--vtxvpid", "on",
        "--largepages", "on",
        "--nestedpaging", "on",
        "--firmware", "bios",
        "--bioslogofadein", "off",
        "--bioslogofadeout", "off",
        "--bioslogodisplaytime", "0",
        "--biosbootmenu", "disabled",
        "--boot1", "dvd",
      ]

      var usage = yield Q.nfcall(vbm.command.exec, "modifyvm");
      if (usage.join("\n").match(/--vtxux/)) {
        cmd.push('--vtxux', 'on');
      }

      yield modifyvm(name, cmd);
      yield config_net_interfaces(name, opts.ip);
      yield config_disks(name, opts.boot, opts.data);

      status_change("installed");
      return yield this.info(name);
    });
  },

  isInstalled(vm_name) {
    return this.info(vm_name).then((status) => {
      return status.installed;
    })
  },

  isRunnig(vm_name) {
    return this.info(vm_name).then((status) => {
      return status.running;
    })
  },

  // TODO: Move install to start
  start(vm_name) {
    log.debug("call to start vm %s", vm_name);
    return Tools.async_status("vm", this, function* (status_change) {
      var info = yield vm.info(vm_name);

      if (info.installed && !(info.running)) {
        status_change("starting");
        // Reconfigures the interface nat all times
        yield config_nat_interface(vm_name, true);
        return instance.start(vm_name).then(() => {
          status_change("started");
          return true
        });
      }
      return false;
    });
  },

  stop(vm_name, force = false) {
    log.debug("call to stop vm %s", vm_name);

    return Tools.async_status("vm", this, function* (status_change) {
      var info = yield vm.info(vm_name);
      if (info.running) {
        status_change("stoping");

        if (force) {
          yield instance.stop(vm_name);
        } else {
          yield acpipowerbutton(vm_name);
        }

        // Wait for shutdown
        while(true) {
          info = yield this.info(vm_name);
          if (!info.running) break;
        }

        status_change("stoped");
        return true;
      }
      return false;
    });
  },

  remove(vm_name) {
    return Tools.async_status("vm", this, function* (status_change) {
      var info = yield vm.info(vm_name);

      if (info.name == vm_name) {
        var fail = (error) => {
          status_change("error", error.stack || error);
        }

        status_change("removing");

        // Removing disk
        if (typeof(info['SATA-1-0']) != 'undefined') {
          yield exec("storagectl", vm_name, "--name", "SATA", "--remove").fail(fail);
          yield exec("closemedium", "disk", info['SATA-1-0']).fail(fail);
        }

        // Remove vm
        yield machine.remove(vm_name).fail(fail);

        // Remove networking interface
        if (info.nic1 != null) {
          yield dhcp.remove_hostonly_server(info.hostonlyadapter1).fail(fail);
          yield hostonly.remove_if(info.hostonlyadapter1).fail(fail);
        }

        status_change("removed");
      }
    });
  },

  make_ssh(vm_name) {
    return async(this, function* () {
      var info = yield this.info(vm_name);
      if (info.running) {
        return new SSH('127.0.0.1', info.ssh_port);
      } else {
        throw new Error("vm is not running");
      }
    });
  },

  ssh(name, cmd, wait = false) {
    return this.make_ssh(name).then((ssh) => { return ssh.exec(cmd, wait) });
  },

  copyFile(name, origin, target) {
    return this.make_ssh(name).then((ssh) => { return ssh.putFile(origin, target) });
  }
}

export { vm as VM };
