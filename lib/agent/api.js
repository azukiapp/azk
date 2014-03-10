'use strict';

/**
 * Module dependencies
 */

var EventEmitter2 = require('eventemitter2').EventEmitter2;
var azk   = require('../azk');
var p9fs  = require('node-p9fs');
var path  = require('path');
var vm    = require('./vm');
var p_box = require('../app/provision_box');

var debug = azk.debug('azk:agent');
var cst   = azk.cst;
var Q     = azk.Q;

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

// TODO: Check for docker ou vm
Api.init = function() {
  return Q.async(function* () {
    yield azk.init();

    //return yield Api.stop();

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

    yield vm.wait(Api.vm_opts.ssh_port);
    debug("azk agent vm is running");

    debug("configure ip...");
    yield vm.ssh(name, "localhost", Api.vm_opts.ssh_port, "sudo ifconfig eth0 "+ ip);

    debug("staring p9fs...");
    Api.p9fs_child = yield p9fs_init();

    if (Api.p9fs_child.running) {
      debug("check and mount file system");
      var cmd = [
        'mkdir -p ' + azk.cst.AZK_AGENT_MOUNT + ';',
        'if [ "$(mount | grep -q "type 9p"; echo $?)" != "0" ] ; then',
        ' sudo mount -t 9p "${SSH_CLIENT%% *}" ' + azk.cst.AZK_AGENT_MOUNT,
        ' -o aname=/,port=5641,dfltuid=$(id -u),dfltgid=$(id -g);',
        'fi',
      ]
      var result = yield vm.ssh(name, ip, 22, cmd.join(' '));
    };

    debug("check base docker image");
    yield p_box({ type: "docker", repository: "tianon/debian", version: "wheezy" })
    .progress(function(event) {
      if (event.type == "pulling") {
        debug("Pulling " + event.image);
      }
    });

    debug("agent is ready");
  })().fail(azk.fail);
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
  Api.stop().then(function() { cb(); }, cb);
}

Api.ex_ping = function(cb) {
  cb(null, 'any');
}

Api.ex_resolve = function(target, cb) {
  cb(null, path.join(cst.AZK_AGENT_MOUNT, target));
}
