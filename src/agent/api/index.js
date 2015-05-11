import { config, lazy_require, log, fsAsync } from 'azk';
import { async, defer, ninvoke, promiseResolve, all } from 'azk/utils/promises';

var lazy = lazy_require({
  ApiWs   : ['azk/agent/api/ws'],
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
      return all([
        (this.api_ws) ? this.api_ws.stop() : promiseResolve(),
        (this.server) ? ninvoke(this.server, "close") : promiseResolve(),
      ]).then(() => {
        this.app    = null;
        this.api_ws = null;
      });
    }
    return promiseResolve();
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
    return fsAsync
      .exists(socket)
      .then((exist) => {
        if (exist) {
          return fsAsync.remove(socket);
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
