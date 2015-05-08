import { _, Q, defer, lazy_require } from 'azk';
import { config, set_config } from 'azk';
import { Agent } from 'azk/agent';
import { AgentNotRunning } from 'azk/utils/errors';

var req = require('request');

var lazy = lazy_require({
  url: 'url',
  WebSocket : 'ws'
});

var HttpClient = {
  url(path) {
    return `http:\/\/unix:${config('paths:api_socket')}:${path}` ;
  },

  request(method, path, opts = {}) {
    return Q.ninvoke(req, method, _.defaults(opts, {
      url : this.url(path),
      json: true,
    }));
  },

  get(...args) {
    return this.request('get', ...args);
  }
};

var WebSocketClient = {
  is_init: false,
  ws: null,
  ws_path: '/',

  init(callback = null) {
    return defer((resolve, reject) => {
      if (this.is_init) {
        resolve();
      }

      var socket_address  = lazy.url.parse(`ws+unix:\/\/${config('paths:api_socket')}`);
      socket_address.path = this.ws_path;

      this.ws = new lazy.WebSocket(socket_address);

      this.ws.on('open', () => {
        console.log('Websocket connected.');
        this.is_init = true;
        resolve();
      });

      this.ws.on('close', () => {
        this.is_init = false;
      });

      this.ws.on('error', (err) => {
        console.log('Error connecting Websocket:', err);
        reject(err);
      });

      this.ws.on('message', (data) => {
        console.log("Received: ", data);
        if (callback) {
          callback(data);
        }
      });
    });
  },

  send(message, callback = null) {
    this.init(callback)
      .then(() => {
        this.ws.send(message);
        return true;
      })
      .fail((err) => {
        console.log('Failed to send message', err);
        return false;
      });
  }
};

var Client = {
  status() {
    var status_obj = {
      agent   : false,
      docker  : false,
      balancer: false,
    };

    return defer((resolve, _reject, notify) => {
      if (Agent.agentPid().running) {
        notify({ type: "status", status: "running" });
        status_obj.agent = true;
      } else {
        notify({ type: "status", status: "not_running" });
      }
      resolve(status_obj);
    });
  },

  start(opts) {
    return Agent.start(opts).then(() => { return 0; });
  },

  stop(opts) {
    return defer((_resolve, _reject, notify) => {
      notify({ type: "status", status: "stopping" });
      return Agent.stop(opts).then((result) => {
        if (result) { notify({ type: "status", status: "stopped" }); }
        return { agent: result };
      });
    });
  },

  configs() {
    return HttpClient
      .request('get', '/configs')
      .spread((response, body) => { return body; });
  },

  syncs() {
    return defer((resolve, reject) => {
      var sync_data = { host_folder: "/tmp/a/*", guest_folder: "/tmp/b" };

      WebSocketClient.ws_path = '/sync/initial';
      WebSocketClient.send(JSON.stringify(sync_data), (response) => {
        switch (response) {
          case 'start':
            console.log('Sync started');
            break;
          case 'done' :
            console.log('Sync finished');
            resolve();
            break;
          case 'fail' :
            console.log('Sync failed');
            reject('Something happened...');
        }
      });
    });
  },

  require() {
    return this
      .status()
      .then((status) => {
        console.log(status);
        if (status.agent) {
          return Q.all([this.configs(), this.syncs()])
            .spread((configs) => {
              _.each(configs, (value, key) => {
                set_config(key, value);
              });
            });
        }
        throw new AgentNotRunning();
      });
  },
};

export { Client, HttpClient };
