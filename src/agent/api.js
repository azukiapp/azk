import { _, Q, defer, async, config, lazy_require } from 'azk';

var lazy = lazy_require({
  Router : ['azk/agent/cli_ws'],
  qfs    : 'q-io/fs'
});

// Module
var Api = {
  server: null,

  wss: null,

  // Express load and init
  get app() {
    if (!this.__app) {
      this.__app = require('express')();
      require('express-ws')(this.__app);
    }
    return this.__app;
  },

  mount() {
    // Return configs from set by Configure
    this.app.get('/configs', (req, res) => {
      var keys = config('agent:config_keys');
      res.json(_.reduce(keys, (acc, key) => {
        acc[key] = config(key);
        return acc;
      }, {}));
    });
  },

  cli_ws() {
    // Init websocket CLI entry point
    this.app.ws('/cli', function(ws) {
      ws.on('message', function(req) {
        lazy.Router.route(ws, JSON.parse(req));
      });
    });
  },

  start() {
    return async(this, function* () {
      // Listen in unix domain socket
      var socket = config('paths:api_socket');
      yield this._clearSocket(socket);
      yield this._listen(socket);

      // Mount entries points
      this.mount();
      this.cli_ws();
    });
  },

  stop() {
    return (this.server) ? Q.ninvoke(this.server, "close") : Q();
  },

  // Remove socket if exist
  _clearSocket(socket) {
    return lazy.qfs
      .exists(socket)
      .then((exist) => {
        if (exist) {
          return lazy.qfs.remove(socket);
        }
      });
  },

  _listen(socket) {
    return defer((resolve, reject) => {
      this.server = this.app.listen(socket, (err) => {
        (err) ? reject(err) : resolve();
      });
    });
  },
};

export { Api };
