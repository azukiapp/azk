import { Q, config, defer, log } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { Agent } from 'azk/agent';

export class Api extends UIProxy {
  status(opts) {
    return defer((done) => {
      var result = 1;
      if (Agent.agentPid().running) {
        this.ok(["agent", "status", "running"]);
        // Requires virtual machine or force use
        if (config('requires_vm') || opts.force_vm) {
          // Check virtual machine file share service
          if (Agent.sharePid().running) {
            this.ok(["agent", "status", "share_running"]);
            result = 0;
          } else {
            this.fail(["agent", "status", "not_share_running"]);
          }
        } else {
          result = 0;
        }
      } else {
        this.fail(["agent", "status", "not_running"]);
      }

      done.resolve(result);
    });
  }

  start(opts) {
    return defer((done) => {
      if (Agent.agentPid().running) {
        this.fail["agent", "status", "running"];
        return done.resolve(1);
      }

      return Agent.start(opts);
      //.progress((event) => {
        //if (event.type == "msg") {
          //this[event.msg_type](...event.msg);
        //}
      //});
    });
  }
}

