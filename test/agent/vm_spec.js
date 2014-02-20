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

describe.only("Azk agent vm", function() {
  var opts   = {
    name : "azk-agent-test",
    ip   : "192.168.51.4",
    boot : azk.cst.VM_BOOT_DISK,
    data : path.join(azk.cst.DEFAULT_FILE_PATH, "boot2docker", "test-disk.vmdk"),
  };

  var remove = function() {
    return Q.async(function* () {
      if (yield qfs.exists(opts.data)) {
        yield qfs.remove(opts.data);
      }
      yield vm.delete(opts.name);
    })();
  }

  after(remove);
  before(remove);

  it("should return installed", function() {
    return h.expect(vm.installed(opts.name)).to.eventually.fail
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
      h.expect(info).has.property("memory", 1024);
    });

    it("should configure network", function() {
      h.expect(info).has.property("nic1", "hostonly");
      h.expect(info).has.property("nictype1", "virtio");
      h.expect(info).has.property("cableconnected1", true);
      h.expect(info).has.property("hostonlyadapter1").and.match(/vboxnet/);
    });

    it("should configure dhcp server", function() {
      var list   = Q.denodeify(vbm.dhcp.list_servers)
      var result = list().then(function(servers) {
        return _.find(servers, function(server) {
          return server.NetworkName.match(RegExp(info.hostonlyadapter1));
        });
      });

      return result.then(function(server) {
        h.expect(server).has.property("IP", "192.168.51.1");
        h.expect(server).has.property("NetworkMask", "255.255.255.0");
        h.expect(server).has.property("lowerIPAddress", "192.168.51.4");
        h.expect(server).has.property("upperIPAddress", "192.168.51.4");
        h.expect(server).has.property("Enabled", "Yes");
      });
    });

    it("should connect boot and data disks", function() {
      h.expect(info).has.property("SATA-0-0", opts.boot);
      //h.expect(info).has.property("SATA-1-0", opts.data);
    });
  });
});
