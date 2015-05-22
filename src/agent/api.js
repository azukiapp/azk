import { _, Q, defer, async, config, lazy_require } from 'azk';

var lazy = lazy_require({
  ApiWs : ['azk/agent/api_ws'],
  qfs   : 'q-io/fs'
});

// Module
var Api = {
  server: null,

  wss: null,

  // Express load and init
  get app() {
    if (!this.__app) {
      this.__app = require('express')();
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

  start() {
    return async(this, function* () {
      // Mount entries points
      this.api_ws = new lazy.ApiWs(this.app);
      this.mount();

      // Listen in unix domain socket
      var socket = config('paths:api_socket');
      yield this._clearSocket(socket);
      yield this._listen(socket);
    });
  },

  stop() {
    return Q.all([
      (this.api_ws) ? this.api_ws.stop() : Q.resolve(),
      (this.server) ? Q.ninvoke(this.server, "close") : Q.resolve(),
    ]);
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
