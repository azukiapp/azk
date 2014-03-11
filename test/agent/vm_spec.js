var h    = require('../spec_helper');
var vm   = require('../../lib/agent/vm');
var os   = require('os');
var vbm  = require('vboxmanage');
var path = require('path');
var qfs  = require('q-io/fs');

var azk  = h.azk;
var Q    = azk.Q;
var _    = azk._;
var exec = Q.nbind(vbm.command.exec, vbm.command);

describe("Azk agent vm", function() {
  var opts   = {
    name : "azk-agent-test",
    ip   : "192.168.51.4",
    ssh_port: 2222,
    boot : azk.cst.VM_BOOT_DISK,
    data : path.join(azk.cst.DEFAULT_DATA_PATH, "vm", "test-disk.vmdk"),
  };

  // Setups
  var remove_disk = function(file) {
    return vm.exec("closemedium", "disk", file).fail(function() {
    });
  }

  var remove = function() {
    this.timeout(0);
    return Q.async(function* () {
      if (yield qfs.exists(opts.data)) {
        yield qfs.remove(opts.data);
      }
      yield vm.stop(opts.name);
      yield vm.delete(opts.name);
      yield remove_disk(opts.data);
      yield remove_disk(opts.data + ".tmp");
    })();
  }

  after(remove);
  before(remove);

  // Tests
  it("should return installed", function() {
    return h.expect(vm.is_installed(opts.name)).to.eventually.fail
  });

  describe("with have a vm", function() {
    var info = null;

    before(function() {
      this.timeout(0);
      return h.expect(vm.init(opts).then(function(i) {
        info = i;
        //console.log(i);
      })).to.eventually.fulfilled
    });

    it("should configure cpus", function() {
      h.expect(info).has.property("ostype").and.match(/Linux.*64/);
      h.expect(info).has.property("cpus", os.cpus().length);
      h.expect(info).has.property("memory", os.totalmem()/1024/1024/4);
    });

    it("should configure network", function() {
      h.expect(info).has.property("nic1", "hostonly");
      h.expect(info).has.property("nictype1", "virtio");
      h.expect(info).has.property("cableconnected1", true);
      h.expect(info).has.property("hostonlyadapter1").and.match(/vboxnet/);

      h.expect(info).has.property("nic2", "nat");
      h.expect(info).has.property("cableconnected2", true);
    });

    it("should connect boot and data disks", function() {
      h.expect(info).has.property("SATA-1-0", opts.data);
    });

    it("should start, stop and return vm status", function() {
      this.timeout(4000);
      return Q.async(function* () {
        h.expect(yield vm.start(opts.name)).to.ok
        h.expect(yield vm.start(opts.name)).to.fail
        h.expect(yield vm.is_running(opts.name)).to.ok
        h.expect(yield vm.stop(opts.name)).to.ok
        h.expect(yield vm.is_running(opts.name)).to.fail
        h.expect(yield vm.stop(opts.name)).to.fail
      })();
    });
  });

  describe("with a vm is running", function() {
    var name, ip, outputs = {};
    var mocks = h.mock_outputs(before, outputs, function() {
      name = azk.cst.VM_NAME;
      ip   = azk.cst.VM_IP;
    });

    it("should return error if vm not exist", function() {
      return h.expect(vm.ssh("not-exist")).to.eventually.rejectedWith(/vm is not running/);
    });

    it("should execute a ssh command", function() {
      this.timeout(0);
      var result = vm.ssh(name, ip, 22, "uptime");

      result.progress(function(event) {
        if (event.type == "stream") {
          event.stream.pipe(mocks.stdout);
        }
      });

      return result.then(function(code) {
        h.expect(code).to.equal(0);
        h.expect(outputs.stdout).to.match(/load average/);
      });
    });

    it("should return code to execute ssh command", function() {
      return h.expect(vm.ssh(name, ip, 22, "exit 127")).to.eventually.equal(127);
    });
  });
});
