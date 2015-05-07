import { _, Q, defer, lazy_require } from 'azk';
import { config, set_config } from 'azk';
import { Agent } from 'azk/agent';
import { AgentNotRunning } from 'azk/utils/errors';

var req = require('request');

var lazy = lazy_require({
  url: 'url',
  WebSocket : 'ws',
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

  init(handler = null) {
    var socket_add  = lazy.url.parse(`ws+unix:\/\/${config('paths:api_socket')}`);
    socket_add.path = '/echo';
    console.log(socket_add);
    this.ws = new WebSocket(socket_add);
    this.ws.on('open', () => this.ws.send('something'));
    this.ws.on('message', (data) => {
      console.log("Received: ", data);
      if (handler) {
        handler(data);
      }
    });

    // this.ws.on('connectFailed', function(error) {
    //   console.log('Connect Error: ' + error.toString());
    // });

    // this.ws.on('connect', function(connection) {
    //   this.ws_connection = connection;
    //   console.log('WebSocket Client Connected');
    //   this.ws_connection.on('error', function(error) {
    //     console.log("Connection Error: " + error.toString());
    //   });

    //   this.ws_connection.on('close', function() {
    //     console.log('echo-protocol Connection Closed');
    //   });

    //   this.ws_connection.on('message', function(message) {
    //     if (message.type === 'utf8') {
    //       console.log("Received: '" + message.utf8Data + "'");
    //     }
    //     if (handler) {
    //       handler(message);
    //     }
    //   });

    // this.ws.on('open', function() {
    //   console.log('WebSocket Client Connected');
    // });

    // this.ws.on('textMessage', function(message) {
    //   console.log("Received: ", message);
    //   if (handler) {
    //     handler(message);
    //   }
    // });

    this.is_init = true;
  },

  // connect(handler) {
  //   if (!this.is_init) {
  //     this.init(handler);
  //   }
  //   this.ws.connect(`ws+unix:\/\/unix:${config('paths:api_socket')}`);
  //   console.log('5', this.ws);
  // },

  send(message, handler) {
    if (!this.is_init || !this.ws.isOpen()) {
      this.init(handler);
    }

    // if (this.ws.isOpen()) {
    this.ws.send(message);
    return true;
    // }

    // return false;
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
    return defer((resolve) => {
      console.log('Posting syncs');
      WebSocketClient.init();
      resolve();
      // var sync_data = { host_folder: "X", guest_folder: "Y" };
      //   WebSocketClient.send(JSON.stringify(sync_data), (response) => {
      //     (response === 'done') ? resolve(sync_data) : reject('Something happened...');
      //   });
    });
  },

  require() {
    return this
      .status()
      .then((status) => {
        console.log(status);
        if (status.agent) {
          return Q.all([this.configs(), this.syncs()])
            .spread((configs, syncs) => {
              _.each(configs, (value, key) => {
                set_config(key, value);
              });
              console.log('final then', syncs);
            });
        }
        throw new AgentNotRunning();
      });
  },
};

export { Client, HttpClient };
