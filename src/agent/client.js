import { Q, config, defer, log } from 'azk';
import { Agent } from 'azk/agent';

var Client = {
  status(opts) {
    var status = {
      agent   : false,
      docker  : false,
      balancer: false,
    }

    return defer((resolve, _reject, notify) => {
      if (Agent.agentPid().running) {
        notify({ type: "status", status: "running" });
        status.agent = true;
      } else {
        notify({ type: "status", status: "not_running" });
      }
      resolve(status);
    });
  },

  start(opts) {
    return Agent.start(opts).then(() => { return 0 });
  },

  stop(opts) {
    return Agent.stop();
  }
}

export { Client };
