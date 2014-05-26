import { config, Q, defer } from 'azk';
import { app }   from 'azk/agent/app';
import { VM  }   from 'azk/agent/vm';
import { Unfsd } from 'azk/agent/unfsd';

var Server = {
  server: null,
  vm_instaled: false,

  start() {
    var self = this;
    return Q.async(function* () {
      // Virtual machine is required?
      if (config('agent:requires_vm')) {
        yield self.installShare();
        //yield self.installVM(true);
      }

      // Load balancer
      //self.installBalancer();

      // Start web api
      self.server = app.listen(config('paths:agent_socket'));

      return defer(() => {});
    })();
  },

  stop() {
    var self = this;
    return Q.async(function* () {
      yield self.removeShare();

      if (self.server) {
        // Stop service
        yield Q.ninvoke(self.server, "close");
      } else {
        return Q.reject("Server not running");
      }
    })();
  },

  installShare() {
    return Unfsd.start();
  },

  removeShare() {
    return Unfsd.stop();
  },

  //installVM(start = false) {
    //var vm_name = config("agent:vm:name");
    //return Q.async(function* () {
      //var installed = yield VM.isInstalled(vm_name);
      //var running   = (installed) ? yield VM.isRunnig(vm_name) : false;

      //if (!installed) {
        //var opts = {
          //name: vm_name,
          //ip  : config("agent:vm:ip"),
          //boot: config("agent:vm:boot_disk"),
          //data: config("agent:vm:data_disk"),
        //}

        //var info = yield VM.init(opts);
      //}
    //})();
  //}

  //__check_vm() {
  //}
}

export { Server };

