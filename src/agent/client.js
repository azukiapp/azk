import { Q, config, defer, log } from 'azk';
import { Agent } from 'azk/agent';

var Client = {
  status(opts) {
    return defer((deferred) => {
      if (Agent.agentPid().running) {
        deferred.notify({ type: "agent", running: true });
        deferred.resolve(0);
      } else {
        deferred.notify({ type: "agent", running: false });
        deferred.resolve(1);
      }
    });
  },

  start(opts) {
    return defer((done) => {
      if (Agent.agentPid().running) {
        done.notify({ type: "agent", running: true });
        return done.resolve(1);
      }

      return Agent.start(opts);
    });
  }
}

export { Client };
