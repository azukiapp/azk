import { _, Q, defer, async, config } from 'azk';
import { Rsync } from 'azk/agent/rsync';

// Express load and init
var qfs        = require('q-io/fs');
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();

require('express-ws')(app);

app.use(bodyParser.urlencoded({ extended: false }));

// Module
var Api = {
  server: null,

  wss: null,

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

  sync() {
    // Init websocket entry point
    app.ws('/sync', function(ws) {
      ws.on('message', function(data) {
        var sync_data = JSON.parse(data);
        var [host_folder, guest_folder] = [sync_data.host_folder, sync_data.guest_folder];

        // TODO: add progress to log single file sync
        ws.send('start');
        Rsync.sync(host_folder, guest_folder)
        .then(() => {
          ws.send('done');
        })
        .fail((err) => {
          ws.send(`fail ${err}`);
        });
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
      this.sync();
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
        if (exist) {
          return qfs.remove(socket);
        }
      });
  },

  _listen(socket) {
    return defer((resolve, reject) => {
      this.server = app.listen(socket, (err) => {
        (err) ? reject(err) : resolve();
      });
    });
  },
};

export { Api };
