import h from 'spec/spec_helper';
import { _, Q, config } from 'azk';
import { VM } from 'azk/agent/vm';
import { net } from 'azk/utils';

var os   = require('os');
var path = require('path');
var vbm  = require('vboxmanage');

var qfs  = require('q-io/fs');
var exec = Q.nbind(vbm.command.exec, vbm.command);

describe.only("Azk agent vm", function() {
  var opts   = {
    name    : config("agent:vm:name"),
    ip      : "192.168.51.4",
    boot    : config("agent:vm:boot_disk"),
    data    : config("agent:vm:data_disk"),
  };

  // Setups
  var remove_disk = function(file) {
    return exec("closemedium", "disk", file).fail(() => {});
  }

  var remove = function() {
    this.timeout(0);
    return Q.async(function* () {
      if (yield qfs.exists(opts.data)) {
        yield qfs.remove(opts.data);
      }
      yield VM.stop(opts.name);
      yield VM.remove(opts.name);
      yield remove_disk(opts.data);
      yield remove_disk(opts.data + ".tmp");
    })();
  }

  after(remove);
  before(remove);

  // Tests
  it("should return installed", function() {
    return h.expect(VM.is_installed(opts.name)).to.eventually.fail
  });

  describe("with have a vm", function() {
    var info = null;

    before(function() {
      this.timeout(0);
      return h.expect(VM.init(opts).then(function(i) {
        info = i;
      })).to.eventually.fulfilled
    });

    it("should configure cpus", function() {
      h.expect(info).has.property("ostype").and.match(/Linux.*64/);
      h.expect(info).has.property("cpus", os.cpus().length);
      h.expect(info).has.property("memory", Math.floor(os.totalmem()/1024/1024/4));
    });

    it("should configure network", function() {
      h.expect(info).has.property("nic1", "hostonly");
      h.expect(info).has.property("cableconnected1", true);
      h.expect(info).has.property("hostonlyadapter1").and.match(/vboxnet/);

      h.expect(info).has.property("nic2", "nat");
      h.expect(info).has.property("cableconnected2", true);

      console.dir(info);
    });

    it("should forwarding ssh port", function() {
      var port = info['Forwarding(0)'].replace(/ssh,tcp,127.0.0.1,(.*),,22/, '$1');
      var portrange = config("agent:portrange_start");
      h.expect(port).to.above(portrange - 1);
    });

    it("should connect boot and data disks", function() {
      h.expect(info).has.property("SATA-1-0", opts.data);
    });

    it("should start, stop and return vm status", function() {
      this.timeout(10000);
      return Q.async(function* () {
        h.expect(yield VM.start(opts.name)).to.ok
        h.expect(yield VM.start(opts.name)).to.fail
        h.expect(yield VM.is_running(opts.name)).to.ok
        h.expect(yield VM.stop(opts.name)).to.ok
        h.expect(yield VM.is_running(opts.name)).to.fail
        h.expect(yield VM.stop(opts.name)).to.fail
      })();
    });
  });

  //describe("with a vm is running", function() {
    //var name, ip, outputs = {};
    //var mocks = h.mock_outputs(before, outputs, function() {
      //name = azk.cst.VM_NAME;
      //ip   = azk.cst.VM_IP;
    //});

    //it("should return error if vm not exist", function() {
      //return h.expect(VM.ssh("not-exist")).to.eventually.rejectedWith(/vm is not running/);
    //});

    //it("should execute a ssh command", function() {
      //this.timeout(0);
      //var result = VM.ssh(name, ip, 22, "uptime");

      //result.progress(function(event) {
        //if (event.type == "stream") {
          //event.stream.pipe(mocks.stdout);
        //}
      //});

      //return result.then(function(code) {
        //h.expect(code).to.equal(0);
        //h.expect(outputs.stdout).to.match(/load average/);
      //});
    //});

    //it("should return code to execute ssh command", function() {
      //return h.expect(VM.ssh(name, ip, 22, "exit 127")).to.eventually.equal(127);
    //});
  //});
});

