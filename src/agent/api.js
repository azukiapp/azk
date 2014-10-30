import { _, Q, defer, async, config } from 'azk';

// Express load and init
var qfs     = require('q-io/fs');
var express = require('express');
var app = express();

// Module
var Api = {
  server: null,

  mount() {
    // Return configs from set by Configure
    app.get('/configs', (req, res) => {
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
      this.mount();

      // Listen in unix domain socket
      var socket = config('paths:api_socket');
      yield this._clearSocket(socket);
      yield this._listen(socket);
    });
  },

  stop() {
    return (this.server) ? Q.ninvoke(this.server, "close") : Q();
  },

  // Remove socket if exist
  _clearSocket(socket) {
    return qfs
      .exists(socket)
      .then((exist) => {
        if (exist) return qfs.remove(socket);
      });
  },

  _listen(socket) {
    return defer((resolve, reject) => {
      this.server = app.listen(socket, (err) => {
        (err) ? reject(err) : resolve();
      });
    });
  }
}

export { Api }
