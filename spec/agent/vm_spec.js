import h from 'spec/spec_helper';
import { _, async, path, Q, config } from 'azk';
import { VM, dhcp, hostonly } from 'azk/agent/vm';
import { net } from 'azk/utils';

var qfs  = require('q-io/fs');
var os   = require('os');
var vbm  = require('vboxmanage');
var exec = Q.nbind(vbm.command.exec, vbm.command);

h.describeSkipVm("Azk agent vm", function() {
  var data_path = config("agent:vm:data_disk");
  var data_test = path.join(path.dirname(data_path), "test-" + path.basename(data_path));
  var net_opts  = {};
  var opts = {
    name: "test-" + config("agent:vm:name"),
    boot: config("agent:vm:boot_disk"),
    data: data_test,
  };

  // Setups
  var remove_disk = function(file) {
    return exec("closemedium", "disk", file).fail(() => {});
  };

  var remove = function() {
    return async(this, function* () {
      var info = yield VM.info(opts.name);
      this.timeout(0);

      if (info.installed) {
        yield VM.stop(opts.name);
        yield VM.remove(opts.name);
      }

      yield remove_disk(opts.data);
      yield remove_disk(opts.data + ".tmp");

      yield qfs.remove(opts.data).fail(() => null);
      yield qfs.remove(opts.data + ".tmp").fail(() => null);
    });
  };

  before(() => {
    return async(this, function* () {
      yield remove.apply(this);

      var interfaces = yield net.getInterfacesIps();
      opts.ip = yield net.generateSuggestionIp(null, interfaces);

      _.merge(net_opts, {
        ip: opts.ip,
        gateway: net.calculateGatewayIp(opts.ip),
        network: net.calculateNetIp(opts.ip),
        netmask: "255.255.255.0",
      });
    });
  });
  after(remove);

  // Tests
  it("should return installed", function() {
    return h.expect(VM.isInstalled(opts.name)).to.eventually.fail;
  });

  describe("with have a vm", function() {
    var aux_tools = {
      install_vm(options = {}) {
        options = _.merge({}, opts, options);
        return async(this, function *() {
          if (this.timeout) { this.timeout(10000); }
          yield remove.apply(this);
          return h.expect(VM.init(options)).to.eventually.fulfilled;
        });
      },
      netinfo() {
        return Q.all([hostonly.list(), dhcp.list_servers()]);
      },
      filter_dhcp(list, VBoxNetworkName) {
        return _.find(list, (server) => server.NetworkName == VBoxNetworkName);
      },
      filter_hostonly(list, name) {
        return _.find(list, (net) => net.Name == name);
      },
    };

    describe("and have a info about vm", function() {
      // Install vm and save state
      var info = {};
      before(function() {
        return aux_tools.install_vm.apply(this).then((i => info = i));
      });

      it("should configure cpus", function() {
        h.expect(info).has.property("ostype").and.match(/Linux.*64/);
        h.expect(info).has.property("cpus", os.cpus().length);
        h.expect(info).has.property("memory", Math.floor(os.totalmem() / 1024 / 1024 / 4));
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
        h.expect(info).has.property("SATA-1-0", opts.data + ".link");
      });

      it("should start, stop and return vm status", function() {
        return async(this, function* () {
          this.timeout(15000);
          h.expect(yield VM.start(opts.name)).to.ok;
          h.expect(yield VM.start(opts.name)).to.fail;
          h.expect(yield VM.isRunnig(opts.name)).to.ok;
          h.expect(yield VM.stop(opts.name, true)).to.ok;
          h.expect(yield VM.isRunnig(opts.name)).to.fail;
          h.expect(yield VM.stop(opts.name)).to.fail;
        });
      });

      it("should set and get guestproperty", function() {
        return async(this, function* () {
          var result, data = "foo", key = "bar";
          // Set property
          yield VM.setProperty(opts.name, key, data, "TRANSIENT");

          // Get property
          result = yield VM.getProperty(opts.name, key);
          h.expect(result).to.eql({ Value: data });

          // Get a not set
          result = yield VM.getProperty(opts.name, "any_foo_key_not_set");
          h.expect(result).to.eql({});
        });
      });
    });

    it("should add and remove dhcp server and hostonly network", function() {
      return async(this, function* () {
        // Install vm and get infos
        var info = yield aux_tools.install_vm.apply(this, [{ dhcp: true }]);
        var data = yield aux_tools.netinfo();

        // Check for vmbox networking
        var net  = aux_tools.filter_hostonly(data[0], info.hostonlyadapter1);
        h.expect(net).to.have.property('Name', info.hostonlyadapter1);
        h.expect(net).to.have.property('IPAddress'  , net_opts.gateway);
        h.expect(net).to.have.property('NetworkMask', net_opts.netmask);

        // Check for dhcp server
        var VBoxNetworkName = net.VBoxNetworkName;
        var server = aux_tools.filter_dhcp(data[1], VBoxNetworkName);
        h.expect(server).to.have.property('lowerIPAddress', opts.ip);
        h.expect(server).to.have.property('upperIPAddress', opts.ip);

        // Removing vm, network and dhcp server
        yield remove.apply(this);
        data = yield aux_tools.netinfo();
        h.expect(aux_tools.filter_hostonly(data[0], info.hostonlyadapter1)).to.empty;
        h.expect(aux_tools.filter_dhcp(data[1], VBoxNetworkName)).to.empty;
      });
    });

    it("should add/remove hostonly network without dhcp server", function() {
      return async(this, function* () {
        // Install vm and get infos
        var info = yield aux_tools.install_vm.apply(this);
        var data = yield aux_tools.netinfo();

        // Check for vmbox networking
        var net  = aux_tools.filter_hostonly(data[0], info.hostonlyadapter1);
        h.expect(net).to.have.property('Name', info.hostonlyadapter1);
        h.expect(net).to.have.property('IPAddress'  , net_opts.gateway);
        h.expect(net).to.have.property('NetworkMask', net_opts.netmask);

        // Networking configure guest ip
        var result, key_base = "/VirtualBox/D2D/eth0";
        result = yield VM.getProperty(opts.name, `${key_base}/address`);
        h.expect(result).to.eql({ Value: net_opts.ip });
        result = yield VM.getProperty(opts.name, `${key_base}/netmask`);
        h.expect(result).to.eql({ Value: net_opts.netmask });
        result = yield VM.getProperty(opts.name, `${key_base}/network`);
        h.expect(result).to.eql({ Value: net_opts.network });

        // Check if dhcp server is disabled
        var VBoxNetworkName = net.VBoxNetworkName;
        h.expect(aux_tools.filter_dhcp(data[1], VBoxNetworkName)).to.empty;

        // Removing vm and network interface
        var events   = [];
        var progress = (event) => events.push(event);
        yield remove.apply(this).progress(progress);
        data = yield aux_tools.netinfo();
        h.expect(aux_tools.filter_hostonly(data[0], info.hostonlyadapter1)).to.empty;
        h.expect(events).to.length(2);
      });
    });
  });

  describe("with a vm is running", function() {
    this.timeout(10000);
    var name = config("agent:vm:name");
    var data = "";
    var progress = (event) => {
      if (event.type == "ssh" && (event.context == "stdout" || event.context == "stderr")) {
        data += event.data.toString();
      }
    };

    beforeEach(() => data = "");

    it("should return error if vm not exist", function() {
      return h.expect(VM.ssh("not-exist")).to.eventually.rejectedWith(/vm is not running/);
    });

    it("should execute a ssh command", function() {
      var result = VM.ssh(name, "sleep 0.5; uptime").progress(progress);
      return result.then(function(code) {
        h.expect(data).to.match(/load average/);
        h.expect(code).to.equal(0);
      });
    });

    it("should return code to execute ssh command", function() {
      return h.expect(VM.ssh(name, "exit 127")).to.eventually.equal(127);
    });

    it("should genereate a new screenshot file", function() {
      return async(this, function* () {
        var file = yield VM.saveScreenShot(name);
        yield h.expect(qfs.exists(file)).to.eventually.fulfilled;
        yield qfs.remove(file);
      });
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
