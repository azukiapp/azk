import { _, Q, config, defer, async, t, log } from 'azk';
import Utils from 'azk/utils';

var vbm  = require('vboxmanage');
var qfs  = require('q-io/fs');
var os   = require('os');
var ssh2 = require('ssh2');

var ssh_timeout = 10000;

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

function config_nat_interface(name, replace = false) {
  return Q.async(function* () {
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
  })();
}

function config_net_interfaces(name, ip) {
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

    // nat interfance
    yield config_nat_interface(name);

    var net_ip   = Utils.net.calculateGatewayIp(ip);
    var net_mask = "255.255.255.0";
    yield hostonly.configure_if(inter, net_ip, net_mask);
  })();
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
    log.info_t("commands.vm.installing");
    return vm.isInstalled(name).then((result) => {
      if (result) return false;

      return Q.async(function* () {
        yield exec("createvm", "--name", name, "--register");

        var cmd = [
          "--ostype", "Linux26_64",
          "--cpus", os.cpus().length,
          "--memory", Math.floor(os.totalmem()/1024/1024/4),
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

        log.info_t("commands.vm.installed_successfully");
        return yield vm.info(name);
      })();
    });
  },

  info(name) {
    return machine.info(name).then((info) => {
      if (info['Forwarding(0)']) {
        var port = info['Forwarding(0)'].replace(/ssh,tcp,127.0.0.1,(.*),,22/, '$1');
        if (port) {
          info.ssh_port = port;
        }
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

  // TODO: Move install to start
  start(name) {
    log.debug("call to start vm %s", name);
    return Q.async(function* () {
      var info      = yield vm.info(name);
      var installed = yield vm.isInstalled(info);
      var running   = yield vm.isRunnig(info);

      if (installed && !(running)) {
        // Reconfigures the interface nat all times
        log.info_t("commands.vm.starting");
        yield config_nat_interface(name, true);
        return instance.start(name).then(() => {
          log.info_t("commands.vm.started");
          return true
        });
      }

      return false;
    })();
  },

  stop(name) {
    log.debug("call to stop vm %s", name);
    return Q.async(function* () {
      var info      = yield vm.info(name);
      var installed = yield vm.isInstalled(info);
      var running   = yield vm.isRunnig(info);

      if (installed && running) {
        log.info_t("commands.vm.stoping");
        yield instance.stop(name);
        log.info_t("commands.vm.stoped");
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

  make_ssh(name) {
    var self = this;
    return Q.async(function* () {
      var info    = yield self.info(name);
      var running = yield self.isRunnig(info);
      if (running) {
        return (...args) => {
          return ssh_run('127.0.0.1', info.ssh_port, ...args);
        }
      } else {
        throw new Error("vm is not running");
      }
    })();
  },

  ssh(name, cmd) {
    return this.make_ssh(name).then((ssh) => { return ssh(cmd) });
  },

  configureIp(name, ip) {
    return this.make_ssh(name).then((ssh_func) => {
      return defer((done) => {
        var cmd = [
          'for i in {0..1}',
          'do interface="eth$i"',
          '  is_set=`/sbin/ifconfig $interface | grep "inet addr:"`',
          '  ( [ -z "$is_set" ] && sudo /sbin/ifconfig $interface ' + ip + ')',
          'done',
          '[[ `/sbin/ifconfig` =~ "inet addr:' + ip + '" ]]',
        ].join('; ');

        var data = null;
        var ssh  = ssh_func(cmd, true).progress((event) => {
          if (event && event.type == 'try_connect') {
            done.notify(event);
            log.info_t("commands.vm.network_pogress", event);
          } else if (event && event.type == "stderr") {
            data = event.data.toString();
          } else {
            done.notify(event);
          }
        });

        return ssh.then((return_code) => {
          if (return_code == 0) {
            log.info_t("commands.vm.network_configured");
            done.resolve();
          } else {
            log.error_t('commands.vm.configureip_fail', data);
            done.reject(1);
          }
        });
      });
    });
  }
}

function ssh_run(host, port, cmd, wait = false) {
  var execute = () => {
    return defer((done) => {
      var client    = new ssh2();
      var exit_code = 0;

      client.on("ready", () => {
        done.notify({ type: 'connected' });
        log.debug("agent vm ssh connected");
        log.debug("agent vm ssh cmd: %s", cmd);

        client.exec(cmd, (err, stream) => {
          if (err) return done.reject(err);
          stream.on('data', (data, extended) => {
            done.notify({ type: extended ? extended : 'stdout', data: data });
          });

          stream.on('exit', (code) => {
            exit_code = code;
            log.debug("agent vm ssh result: %s", code);
            process.nextTick(() => client.end());
          });
        });
      });

      client.on('end', () => {
        done.resolve(exit_code);
      });

      client.on('error', (err) => done.reject(err));

      client.connect({
        host, port,
        username: config("agent:vm:user"),
        readyTimeout: ssh_timeout,
        password: config("agent:vm:password"),
      });
    });
  }

  // TODO: change timeout and attempts for a logic value
  if (wait) {
    return Utils.net.waitForwardingService(host, port, 15).then(() => {
      return execute();
    });
  } else {
    return execute();
  }
}

export { vm as VM };
