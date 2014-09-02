import h from 'spec/spec_helper';
import { _, async, Q, config } from 'azk';
import { VM } from 'azk/agent/vm';
import { net } from 'azk/utils';

var os   = require('os');
var path = require('path');
var vbm  = require('vboxmanage');

var qfs  = require('q-io/fs');
var exec = Q.nbind(vbm.command.exec, vbm.command);

h.describeSkipVm("Azk agent vm", function() {
  var data_path = config("agent:vm:data_disk");
  var data_test = path.join(path.dirname(data_path), "test-" + path.basename(data_path));

  var opts = {
    name: "test-" + config("agent:vm:name"),
    ip  : "192.168.51.4",
    boot: config("agent:vm:boot_disk"),
    data: data_test,
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
    return h.expect(VM.isInstalled(opts.name)).to.eventually.fail
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
    });

    it("should forwarding ssh port", function() {
      var portrange = config("agent:portrange_start");
      h.expect(info.ssh_port).to.above(portrange - 1);
    });

    it("should connect boot and data disks", function() {
      h.expect(info).has.property("SATA-1-0", opts.data);
    });

    it("should start, stop and return vm status", function() {
      this.timeout(10000);
      return Q.async(function* () {
        h.expect(yield VM.start(opts.name)).to.ok
        h.expect(yield VM.start(opts.name)).to.fail
        h.expect(yield VM.isRunnig(opts.name)).to.ok
        h.expect(yield VM.stop(opts.name, true)).to.ok
        h.expect(yield VM.isRunnig(opts.name)).to.fail
        h.expect(yield VM.stop(opts.name)).to.fail
      })();
    });
  });

  describe("with a vm is running", function() {
    this.timeout(10000);
    var name = config("agent:vm:name");
    var data = "";
    var progress = (event) => {
      if (event.type == "ssh" && event.context == "stdout") {
        data += event.data.toString();
      }
    }

    beforeEach(() => data = "");

    it("should return error if vm not exist", function() {
      return h.expect(VM.ssh("not-exist")).to.eventually.rejectedWith(/vm is not running/);
    });

    it("should execute a ssh command", function() {
      var result = VM.ssh(name, "uptime").progress(progress);
      return result.then(function(code) {
        h.expect(code).to.equal(0);
        h.expect(data).to.match(/load average/);
      });
    });

    it("should return code to execute ssh command", function() {
      return h.expect(VM.ssh(name, "exit 127")).to.eventually.equal(127);
    });

    it("should copy file to vm", function() {
      return async(this, function* () {
        var code;

        code = yield VM.copyFile(name, __filename, "/tmp/azk/file").progress(progress);
        h.expect(code).to.equal(0);

        code = yield VM.ssh(name, "cat /tmp/azk/file").progress(progress);
        h.expect(code).to.equal(0);
        h.expect(data).to.match(/should\scopy\sfile\sto\svm/);
      });
    });
  });
});

