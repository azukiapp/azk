var os    = require('os');
var fs    = require('fs');
var azk   = require('../azk');
var vbm   = require('vboxmanage');
var qify  = require('q-ify');
var qfs   = require('q-io/fs');
var zlib  = require('zlib');
var ssh2  = require('ssh2');
var path  = require('path');

var cst = azk.cst;
var Q   = azk.Q;
var _   = azk._;

var vm   = module.exports = {};

function list_methods(target) {
  return _.map(target, function(_, name) {
    return name;
  });
}

var machine  = qify(vbm.machine , list_methods(vbm.machine));
var instance = qify(vbm.instance, list_methods(vbm.instance));
var hostonly = qify(vbm.hostonly, list_methods(vbm.hostonly));
var dhcp     = qify(vbm.dhcp    , list_methods(vbm.dhcp));

function unzip(origin, target) {
  var done  = Q.defer();

  try {
    var input  = fs.createReadStream(origin);
    var output = fs.createWriteStream(target);

    output.on("close", function() {
      done.resolve();
    });

    input.pipe(zlib.createGunzip()).pipe(output);
  } catch (err) {
    done.reject(err);
  }

  return done.promise;
}

function exec() {
  var args = _.toArray(arguments);
  return Q.nfapply(vbm.command.exec, args)
  .then(function(result) {
    if (result[0] != 0) {
      result[1] = "command: " + args.join(' ') + "\n\n" + result[1];
      throw new Error(result[1]);
    }
    return result[1];
  });
}

function modifyvm(name, options) {
  options.unshift("modifyvm", name);
  return exec.apply(null, options);
}

var hdds = {
  list: function() {
    return exec("list", "hdds").then(function(output) {
      return vbm.parse.linebreak_list(output);
    });
  },

  close: function(file, remove) {
    var args = ["closemedium", "disk", file];
    if (remove) { args.push("--delete"); }
    return exec.apply(null, args);
  },

  clonehd: function(origin, target) {
    var self = this;
    return exec("clonehd", origin, target)
      .then(hdds.list)
      .then(function(hdds) {
        var closes = [];
        _.each(hdds, function(hdd) {
          if (_.contains([origin, target], hdd.Location)) {
            closes.push(self.close(hdd.Location), hdd.Location == origin);
          }
        });
        return Q.all(closes);
      });
  },
}

var nat = {
  list: function() {
    return exec("list", "natnets")
  },

  add: function(name, net) {
    return exec(
      "natnetwork", "add", "-t", name, "-n", net, "-e", "-h", "on"
    ).then(function() {
      return true;
    });
  },
}

function conf_networking(name, ip, ssh_port) {
  var nat_name = "azk-nat-network";

  return Q.async(function* () {
    var result    = yield exec("hostonlyif", "create");
    var interface = result.match(/Interface '(.*)?'/)[1];

    yield modifyvm(name, [
      "--nic1", "hostonly",
      "--nictype1", "virtio",
      "--cableconnected1", "on",
      "--hostonlyadapter1", interface
    ]);

    yield modifyvm(name, [
      "--nic2", "nat",
      "--cableconnected2", "on",
      "--natpf2", "ssh,tcp,127.0.0.1," + ssh_port + ",,22"
    ]);

    var net_ip   = azk.utils.net_ip(ip);
    var net_mask = "255.255.255.0";
    yield hostonly.configure_if(interface, net_ip, net_mask);
  })();
}

function conf_disks(name, boot, data) {
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

  return Q.async(function* () {
    if (!(yield qfs.exists(data))) {
      var file = data + ".tmp";
      yield unzip(cst.VM_BLANK_DISK, file);
      yield hdds.clonehd(file, data);
    }

    yield exec.apply(null, storage_opts);
    yield exec.apply(null, storage_boot);
    yield exec.apply(null, storage_data);
  })();
}

vm.init = function(opts) {
  var name = opts.name;
  return vm.is_installed(name).then(function(result) {
    if (result) return false;

    return Q.async(function* () {
      yield exec("createvm", "--name", name, "--register");

      var cmd = [
        "--ostype", "Linux26_64",
        "--cpus", os.cpus().length,
        "--memory", Math.floor(os.totalmem()/1024/1024/4),
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
      yield conf_networking(name, opts.ip, opts.ssh_port);
      yield conf_disks(name, opts.boot, opts.data);

      return yield vm.info(name);
    })();
  });
}

vm.delete = function(name) {
  return Q.async(function* () {
    var info = yield vm.info(name);

    if (info.name == name) {
      // Removing disk
      if (typeof(info['SATA-1-0']) != 'undefined') {
        yield exec("storagectl", name, "--name", "SATA", "--remove");
        yield exec("closemedium", "disk", info['SATA-1-0']);
      }

      // Remove vm
      yield machine.remove(name);

      // Remove networking interface
      if (info.nic1 != null) {
        yield hostonly.remove_if(info.hostonlyadapter1);
      }
    }
  })();
}

vm.info = function(name) {
  return machine.info(name).fail(function(err) {
    if (err.message.match(/cannot show vm info/))
      return {};
    throw err;
  });
}

vm.is_installed = function(name_or_info) {
  var promise = _.isObject(name_or_info) ?
    Q(name_or_info) : vm.info(name_or_info);

  return promise.then(function(info) {
    return !_.isEqual(info, {});
  });
}

vm.is_running = function(name_or_info) {
  var promise = _.isObject(name_or_info) ?
    Q(name_or_info) : vm.info(name_or_info);

  return promise.then(function(info) {
    return info.VMState == "running";
  });
}

vm.start = function(name) {
  return Q.async(function* () {
    var info = yield vm.info(name);
    var installed = yield vm.is_installed(info);
    var running = yield vm.is_running(info);

    if (installed && !(running)) {
      return instance.start(name).then(function() { return true });
    }

    return false;
  })();
}

vm.stop = function(name) {
  return Q.async(function* () {
    var info = yield vm.info(name);
    var installed = yield vm.is_installed(info);
    var running = yield vm.is_running(info);

    if (installed && running) {
      yield instance.stop(name);
      return true;
    }

    return false;
  })().fail(console.log);
}

vm.wait = function(port, host) {
  host = host || 'localhost'
  return azk.utils.ping({ host: host, port: port })
  .then(function(result) {
    if (!result) {
      return vm.wait(port, host);
    }
  });
}

function ssh_run(ip, port, cmd) {
  var done = Q.defer();

  var c = new ssh2();
  c.on("ready", function() {
    done.notify({ type: 'connected' });

    c.exec(cmd, function(err, stream) {
      if (err) return done.reject(err);
      done.notify({ type: 'stream', stream: stream });

      stream.on('exit', function(code) {
        done.resolve(code);
        process.nextTick(function() {
          c.end();
        });
      });
    });
  });

  c.on('error', function(err) {
    done.reject(err);
  });

  c.connect({
    host: ip,
    port: port,
    username: azk.cst.VM_USER,
    readyTimeout: 5000,
    password: "live",
  });

  return done.promise;
}

vm.ssh = function(name, ip, port, cmd) {
  var self = this;

  return Q.async(function* () {
    var running = yield self.is_running(name);
    if (running) {
      return yield ssh_run(ip, port, cmd);
    } else {
      throw new Error("vm is not running");
    }
  })();
}

vm.exec = exec;
