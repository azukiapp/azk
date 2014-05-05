import { _, Q, config, defer, t } from 'azk';
import Utils from 'azk/utils';

var vbm  = require('vboxmanage');
var qfs  = require('q-io/fs');
var os   = require('os');
var ssh2 = require('ssh2');

var machine  = Utils.qifyModule(vbm.machine );
var instance = Utils.qifyModule(vbm.instance);
var hostonly = Utils.qifyModule(vbm.hostonly);
var dhcp     = Utils.qifyModule(vbm.dhcp    );

var _exec = Q.nbind(vbm.command.exec, vbm.command);
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

function conf_networking(name, ip, ssh_port) {
  var nat_name = "azk-nat-network";

  return Q.async(function* () {
    var result = yield exec("hostonlyif", "create");
    var inter  = result.match(/Interface '(.*)?'/)[1];

    yield modifyvm(name, [
      "--nic1", "hostonly",
      "--nictype1", "virtio",
      "--cableconnected1", "on",
      "--hostonlyadapter1", inter
    ]);

    yield modifyvm(name, [
      "--nic2", "nat",
      "--nictype2", "virtio",
      "--cableconnected2", "on",
      "--natpf2", "ssh,tcp,127.0.0.1," + ssh_port + ",,22"
    ]);

    var net_ip   = Utils.net.calculateNetIp(ip);
    var net_mask = "255.255.255.0";
    yield hostonly.configure_if(inter, net_ip, net_mask);
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
      yield Utils.unzip(config("agent:vm:blank_disk"), file);
      yield hdds.clonehd(file, data);
    }

    yield exec.apply(null, storage_opts);
    yield exec.apply(null, storage_boot);
    yield exec.apply(null, storage_data);
  })();
}

var vm = {
  init(opts) {
    var name = opts.name;
    return vm.isInstalled(name).then((result) => {
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

        var ssh_port = yield Utils.net.getPort();
        yield modifyvm(name, cmd);
        yield conf_networking(name, opts.ip, ssh_port);
        yield conf_disks(name, opts.boot, opts.data);

        return yield vm.info(name);
      })();
    });
  },

  info(name) {
    return machine.info(name).then((info) => {
      var port = info['Forwarding(0)'].replace(/ssh,tcp,127.0.0.1,(.*),,22/, '$1');
      if (port) {
        info.ssh_port = port;
      }
      return info;
    }, (err) => {
      if (err.message.match(/cannot show vm info/))
        return {};
      throw err;
    });
  },

  isInstalled(name_or_info) {
    var promise = _.isObject(name_or_info) ?
      Q(name_or_info) : vm.info(name_or_info);

    return promise.then((info) => {
      return !_.isEqual(info, {});
    });
  },

  isRunnig(name_or_info) {
    var promise = _.isObject(name_or_info) ?
      Q(name_or_info) : vm.info(name_or_info);

    return promise.then((info) => {
      return info.VMState == "running";
    });
  },

  start(name) {
    return Q.async(function* () {
      var info      = yield vm.info(name);
      var installed = yield vm.isInstalled(info);
      var running   = yield vm.isRunnig(info);

      if (installed && !(running)) {
        return instance.start(name).then(() => { return true });
      }

      return false;
    })();
  },

  stop(name) {
    return Q.async(function* () {
      var info      = yield vm.info(name);
      var installed = yield vm.isInstalled(info);
      var running   = yield vm.isRunnig(info);

      if (installed && running) {
        yield instance.stop(name);
        return true;
      }

      return false;
    })().fail(console.log);
  },

  remove(name) {
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
  },

  ssh(name, cmd) {
    var self = this;
    return Q.async(function* () {
      var info    = yield self.info(name);
      var running = yield self.isRunnig(info);
      if (running) {
        return yield ssh_run('127.0.0.1', info.ssh_port, cmd);
      } else {
        throw new Error("vm is not running");
      }
    })();
  },

  configureIp(name, ip) {
    return defer((done) => {
      var cmd = [
        'for i in {0..1}; do',
        '  interface="eth$i"; ',
        '  is_set=`/sbin/ifconfig $interface | grep "inet addr:"` ;',
        '  ( [ -z "$is_set" ] && sudo /sbin/ifconfig $interface ' + ip + ');',
        'done; ',
      ]

      var attempts  = 1, max = 15;
      var configure = function() {
        done.notify({ attempts, max });
        return vm.ssh(name, cmd.join(' '))
          .then(done.resolve, function(err) {
            if (attempts < max) {
              attempts++;
              return configure();
            }
            done.reject(err);
          });
      }

      process.nextTick(() => configure().fail(done.reject) );
    });
  }
}

function ssh_run(host, port, cmd) {
  return defer((done) => {
    var c = new ssh2();

    c.on("ready", () => {
      done.notify({ type: 'connected' });

      c.exec(cmd, (err, stream) => {
        if (err) return done.reject(err);
        stream.on('data', (data, extended) => {
          done.notify({ type: extended ? extended : 'stdout', data: data });
        });

        stream.on('exit', (code) => {
          done.resolve(code);
          process.nextTick(() => c.end());
        });
      });
    });

    c.on('error', (err) => done.reject(err));

    c.connect({
      host, port,
      username: config("agent:vm:user"),
      readyTimeout: 10000,
      password: config("agent:vm:password"),
    });
  });
}

export { vm as VM };
