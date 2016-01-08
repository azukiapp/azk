import { _, lazy_require, log } from 'azk';
import { publish } from 'azk/utils/postal';
import { defer, promiseResolve, promisify } from 'azk/utils/promises';
import { config, set_config } from 'azk';
import { Agent } from 'azk/agent';
import { AgentNotRunning } from 'azk/utils/errors';

var lazy = lazy_require({
  uuid      : 'node-uuid',
  url       : 'url',
  WebSocket : 'ws',
  request   : 'request',
});

var HttpClient = {
  url(path) {
    return `http:\/\/unix:${config('paths:api_socket')}:${path}` ;
  },

  request(method, path, opts = {}) {
    method = promisify(lazy.request[method], { multiArgs: true, context: lazy.request });
    return method(_.defaults(opts, {
      url : this.url(path),
      json: true,
    }));
  },

  get(...args) {
    return this.request('get', ...args);
  }
};

var WebSocketClient = {
  ws_path: '/cli',
  _ws: null,
  _status: null,
  _buffer: [],
  _cb: {},

  init() {
    return defer((resolve, reject) => {
      if (this._status === 'connecting' || this._status === 'connected') {
        return resolve();
      }

      this._status = 'connecting';

      var socket_address  = lazy.url.parse(`ws+unix:\/\/${config('paths:api_socket')}`);
      socket_address.path = this.ws_path;

      this._ws = new lazy.WebSocket(socket_address);

      this._ws.on('open', () => {
        this._status = 'connected';
        log.debug('Websocket connected.');
        while (this._buffer.length > 0 && this._ws) {
          var item = this._buffer.shift();
          var message = item.message;
          message.id = this._generate_msg_id();
          this._cb[message.id] = item.callback;
          this._ws.send(JSON.stringify(message));
        }
        resolve();
      });

      this._ws.on('close', () => {
        this._status = 'closed';
        log.debug('Websocket closed.');
      });

      this._ws.on('error', (err) => {
        log.error('Error on websocket:', err);
        reject(err);
      });

      this._ws.on('message', (data) => {
        var message = JSON.parse(data);
        if (!this._cb[message.id]) { return; }
        var callback = this._cb[message.id];
        callback(message, () => {
          delete this._cb[message.id];
        });
      });
    });
  },

  close() {
    this._ws.on('error', (err) => {
      log.error('Error closing websocket:', err);
    });

    if (this._status !== 'closed') {
      this._ws.close();
    }
    this._status = 'closed';
    return true;
  },

  send(message, callback = null, retry = 0) {
    this.init()
      .catch((err) => {
        log.error('Failed to init websocket: ', err);
      })
      .then(() => {
        if (this._status == 'connected') {
          message.id = this._generate_msg_id();
          this._cb[message.id] = callback;
          this._ws.send(JSON.stringify(message));
        } else {
          this._buffer.push({message, callback});
        }
        return true;
      })
      .catch((err) => {
        if (retry-- > 0) {
          log.debug('Failed to send message: ', message);
          log.debug('Retry: ', retry);
          return this.send(message, callback, retry);
        } else {
          log.error('Failed to send message to websocket: ', err);
          return false;
        }
      });
  },

  _generate_msg_id() {
    return lazy.uuid.v1().split('-')[0];
  }
};

var Client = {
  status(action_name, pub = true) {
    var pid = Agent.agentPid();
    var status_obj = {
      pid     : pid,
      agent   : pid.running,
      docker  : false,
      balancer: false,
    };

    if (pub) {
      var status = status_obj.agent ? "running" : "not_running";
      publish("agent.client.status", { type: "status", status });
    }

    return promiseResolve(status_obj);
  },

  start(opts) {
    return Agent.start(opts).then(() => { return 0; });
  },

  stop(opts) {
    return this.status()
    .then((status) => {
      if (status.agent) {
        return Agent.stop(opts).then((result) => {
          return { agent: result };
        });
      } else {
        return { agent: false };
      }
    });
  },

  configs() {
    return HttpClient
      .get('/configs')
      .spread((response, body) => { return body; });
  },

  watch(host_folder, guest_folder, opts = {}) {
    return defer((resolve, reject) => {
      var req = { action: 'watch', data: { host_folder, guest_folder, opts } };
      WebSocketClient.send(req, (res, end) => {
        switch (res.status) {
          case 'start':
            publish("sync.status", { type: "starting" });
            break;
          case 'sync':
            publish("sync.status", { type: "sync", status: res.data });
            break;
          case 'done' :
            end();
            resolve(true);
            break;
          case 'fail' :
            end();
            reject(res.err);
            break;
        }
      });
    });
  },

  unwatch(host_folder, guest_folder) {
    return defer((resolve, reject) => {
      var req = { action: 'unwatch', data: { host_folder, guest_folder } };
      WebSocketClient.send(req, (res, end) => {
        switch (res.status) {
          case 'fail':
            end();
            reject();
            break;
          default:
            end();
            resolve(true);
            break;
        }
      });
    });
  },

  watchers() {
    return defer((resolve) => {
      var req = { action: 'watchers' };
      WebSocketClient.send(req, (res, end) => {
        end();
        resolve(res);
      });
    });
  },

  ssh_opts() {
    var key = `-i ${config('agent:vm:ssh_key')}`;
    return {
      url : `${config('agent:vm:user')}@${config('agent:vm:ip')}`,
      opts: key + " -o StrictHostKeyChecking=no -o LogLevel=quiet -o UserKnownHostsFile=/dev/null",
    };
  },

  close_ws() {
    return WebSocketClient.close();
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

export { Client, HttpClient, WebSocketClient };
