import { _, Q, defer, lazy_require, log } from 'azk';
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
        log.debug('Websocket connected.');
        this.is_init = true;
        resolve();
      });

      this.ws.on('close', () => {
        log.debug('Websocket closed.');
        this.is_init = false;
      });

      this.ws.on('error', (err) => {
        log.error('Error on websocket:', err);
        reject(err);
      });

      this.ws.on('message', (data) => {
        if (callback) {
          callback(data);
        }
      });
    });
  },

  close() {
    this.ws.on('error', (err) => {
      log.error('Error closing websocket:', err);
    });

    if (this.is_init) {
      this.ws.close();
    }
    this.is_init = false;
  },

  send(message, callback = null, retry = 0) {
    this.init(callback)
      .then(() => {
        this.ws.send(message);
        return true;
      })
      .fail((err) => {
        if (retry-- > 0) {
          log.debug('Failed to send message: ', message);
          log.debug('Retry: ', retry);
          return this.send(message, callback, retry);
        } else {
          log.error('Failed to send message to websocket: ', err);
          return false;
        }
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

  sync(host_folder, guest_folder) {
    return defer((resolve, reject, notify) => {
      var sync_data = { host_folder, guest_folder };
      WebSocketClient.ws_path = '/sync';
      WebSocketClient.send(JSON.stringify(sync_data), (response) => {
        var response_ary    = response.split(' ');
        var [result, data] = [response_ary.shift(), response_ary.join(' ')];
        switch (result) {
          case 'start':
            notify({ type: "status", status: "starting" });
            break;
          case 'sync':
            notify({ type: "sync", status: data });
            break;
          case 'done' :
            WebSocketClient.close();
            resolve();
            break;
          case 'fail' :
            WebSocketClient.close();
            reject(data);
            break;
        }
      });
    });
  },

  require() {
    return this
      .status()
      .then((status) => {
        if (status.agent) {
          return this.configs();
        }
        throw new AgentNotRunning();
      })
      .then((configs) => {
        _.each(configs, (value, key) => {
          set_config(key, value);
        });
      });
  },
};

export { Client, HttpClient };
