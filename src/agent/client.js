import { _, Q, defer, log } from 'azk';
import { config, set_config } from 'azk';
import { Agent } from 'azk/agent';
import { AgentNotRunning } from 'azk/utils/errors';

var request = require('request');

var HttpClient = {
  url(path) {
    return `http:\/\/unix:${config('paths:api_socket')}:${path}` ;
  },

  request(method, path, opts = {}) {
    return Q.ninvoke(request, method, _.defaults(opts, {
      url : this.url(path),
      json: true,
    }));
  },

  get(...args) {
    return this.request('get', ...args);
  }
}

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
    return Agent.stop(opts);
  },

  configs() {
    return HttpClient
      .request('get', '/configs')
      .spread((response, body) => { return body; });
  },

  require() {
    return this.status()
      .then((status) => {
        if (status.agent) return this.configs();
        throw new AgentNotRunning();
      })
      .then((configs) => {
        _.each(configs, (value, key) => {
          set_config(key, value);
        });
      });
  },
}

export { Client, HttpClient };
