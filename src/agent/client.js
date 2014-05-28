import { Q, config, defer, log } from 'azk';
import { Agent } from 'azk/agent';

var Client = {
  status(opts) {
    return defer((resolve, _reject, notify) => {
      if (Agent.agentPid().running) {
        notify({ type: "status", status: "running" });
        resolve(0);
      } else {
        notify({ type: "status", status: "not_running" });
        resolve(1);
      }
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
