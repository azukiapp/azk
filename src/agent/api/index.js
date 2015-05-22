import { config, lazy_require, log } from 'azk';
import { Q, defer, async } from 'azk';

var lazy = lazy_require({
  ApiWs   : ['azk/agent/api/ws'],
  qfs     : 'q-io/fs',
  hotswap : 'hotswap',
});

// Module
var Api = {
  server: null,

  // Express load and init
  get app() {
    if (!this.__app) {
      this.app = require('express')();
    }
    return this.__app;
  },

  set app(value) {
    this.__app = value;
  },

  start() {
    log.debug("[api] starting server api");
    try {
      lazy.hotswap.on('swap', () => {
        log.debug("[api] reloading server api");
        this._make_new_app();
      });
    } catch (err) {
      log.debug("[api] install hotswap.", err.stack ? err.stack : err.toString());
    }

    return this._make_new_app();
  },

  stop() {
    if (this.server || this.api_ws) {
      log.debug("[api] stopping server api");
      return Q.all([
        (this.api_ws) ? this.api_ws.stop() : Q.resolve(),
        (this.server) ? Q.ninvoke(this.server, "close") : Q.resolve(),
      ]).then(() => {
        this.app    = null;
        this.api_ws = null;
      });
    }
    return Q.resolve();
  },

  _make_new_app() {
    return async(this, function* () {
      // Prevent
      yield this.stop();

      // Mount entries points
      this.api_ws = new lazy.ApiWs(this.app);
      require('azk/agent/api/routes')(this.app);

      // Listen in unix domain socket
      var socket = config('paths:api_socket');
      yield this._clearSocket(socket);
      yield this._listen(socket);
    });
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
