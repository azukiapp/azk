'use strict';

/**
 * Module dependencies
 */

var EventEmitter2 = require('eventemitter2').EventEmitter2;
var azk   = require('../azk');
var p9fs  = require('node-p9fs');
var path  = require('path');
var vm    = require('./vm');
var proxy = require('./proxy');
var p_box = require('../app/provision_box');

var debug = azk.debug('azk:agent');
var cst   = azk.cst;
var Q     = azk.Q;
var _     = azk._;

/**
 * Expose Api
 */

var Api = module.exports = {
  bus : new EventEmitter2({
    wildcard: true,
    delimiter: ':',
    newListener: false,
    maxListeners: 20
  }),
  p9fs_child: null,
  vm_opts: {
    name : azk.cst.VM_NAME,
    boot : azk.cst.VM_BOOT_DISK,
    data : azk.cst.VM_DATA_DISK,
    ssh_port: azk.cst.VM_SSH_MAP_PORT,
  }
};

function p9fs_init() {
  var done  = Q.defer();
  var child = p9fs(cst.SPFS_PORT, cst.SPFS_IP);
  child.on('start', function() {
    debug(
      'p9fs server started in %s:%s',
      cst.SPFS_IP, cst.SPFS_PORT
    )
    done.resolve(child);
  });

  return done.promise;
}

function configure_ip(name, ip) {
  var done = Q.defer();
  var file = "`pwd`/interfaces; ";
  var cmd  = [
    'echo "allow-hotplug eth1" > ' + file,
    'echo "iface eth1 inet static" >> ' + file,
    'echo "      address ' + ip + '" >> ' + file,
    'echo "      netmask 255.255.255.0" >> ' + file,
    "sudo /sbin/ifup eth1 --force -i " + file
  ]

  var attempts  = 1, max = 8;
  var configure = function() {
    done.notify("try configure ip (" + attempts + "/" + max + ") ...");
    return vm.ssh(name, "localhost", Api.vm_opts.ssh_port, cmd.join(' '))
      .then(done.resolve, function(err) {
        if (attempts < max) {
          attempts++;
          return configure();
        }
        done.reject(err);
      });
  }

  process.nextTick(function() { configure().fail(done.reject) });
  return done.promise;
}

function configure_socat(name, ip) {
  var done = Q.defer();

  done.notify("configure socat...");
  var cmd = [
    'echo "SOCAT_OPTIONS=\'tcp-l:80,fork tcp:${SSH_CONNECTION%% *}:' + azk.cst.DAEMON_PROXY_PORT + '\'" > `pwd`/socat; ',
    'sudo /etc/init.d/socat start',
  ];
  vm.ssh(name, ip, 22, cmd.join(' ')).then(done.resolve, done.reject);

  return done.promise;
}

// TODO: Check for docker ou vm
Api.init = function() {
  return Q.async(function* () {
    yield azk.init();

    proxy.start(null, function() {
      debug(azk.t.apply(null, _.toArray(arguments)));
    });

    Api.vm_opts.ip = azk.cst.VM_IP;
    var name = Api.vm_opts.name;
    var ip   = Api.vm_opts.ip;

    if (!(yield vm.is_installed(name))) {
      debug("create a azk agent vm");
      yield vm.init(Api.vm_opts);
    }

    if (!(yield vm.is_running(name))) {
      debug("botting azk agent vm");
      var result = yield vm.start(name);
      if (!result) {
        azk.fail("unable to initialize the agent vm");
        process.exit();
      }
    }

    var progress = function() {
      debug.apply(null, _.toArray(arguments));
    }

    debug("azk agent vm is started");
    yield configure_ip(name, ip).progress(progress);
    yield configure_socat(name, ip).progress(progress);

    debug("staring p9fs...");
    Api.p9fs_child = yield p9fs_init();

    if (Api.p9fs_child.running) {
      debug("check and mount file system");
      var cmd = [
        'mkdir -p ' + azk.cst.AZK_AGENT_MOUNT + ';',
        '9mount -i -u -a/ "tcp"\'!\'"${SSH_CONNECTION%% *}"\'!\'"5641"',
        azk.cst.AZK_AGENT_MOUNT
      ];
      var result = yield vm.ssh(name, ip, 22, cmd.join(' '));
    };

    var image = azk.cst.DOCKER_DEFAULT_IMG.split(":");
    debug("check base docker image: %s", azk.cst.DOCKER_DEFAULT_IMG);
    yield p_box({ type: "docker", repository: image[0], version: image[1] })
    .progress(function(event) {
      if (event.type == "pulling") {
        debug("Pulling " + event.image);
      }
    });

    debug("agent is ready");
  })().fail(function(err) {
    azk.fail(err);
    process.kill(process.pid, 'SIGTERM');
  });
}

Api.ex_status = function(cb) {
  cb(null, {
    pid: process.pid,
    p9fs: {
      running: Api.p9fs_child.running,
      pid: Api.p9fs_child.childData.pid,
    }
  });
}

function stop_p9fs() {
  var done = Q.defer();

  if (Api.p9fs_child && Api.p9fs_child.running) {
    Api.p9fs_child.on('stop', function() {
      done.resolve();
      process.nextTick(process.exit);
    });
    Api.p9fs_child.stop();
  } else {
    done.resolve();
  }

  return done.promise;
}

Api.stop = function() {
  return Q.async(function* () {
    // Stopping and remove vm
    var name = Api.vm_opts.name;
    debug("stoping vm");
    if (yield vm.stop(name)) {
      debug("deleting vm");
      yield vm.delete(name);
    }

    debug("stoping p9fs server");
    yield stop_p9fs();

    debug("all services depedencies stoped");
  })().fail(console.log);
};

Api.ex_stop = function(cb) {
  Api.stop().then(function() { cb(); process.exit(0); }, function(err) {
    azk.fail(err.stack);
    process.exit(cst.ERROR_EXIT);
  });
}

Api.ex_ping = function(cb) {
  cb(null, 'any');
}

Api.ex_resolve = function(target, cb) {
  cb(null, path.join(cst.AZK_AGENT_MOUNT, target));
}

// Proxy api
Api.ex_proxy_register = function(host, backend, cb) {
  cb(proxy.register(host, backend));
}

Api.ex_proxy_remove = function(host, backend, cb) {
  cb(prox.remove(host, backend));
}
