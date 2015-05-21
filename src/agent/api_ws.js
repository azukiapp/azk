import { Q, lazy_require, log } from 'azk';

var lazy = lazy_require({
  Watcher: ['azk/sync/watcher'],
});

export class ApiWs {
  constructor(app) {
    this._app = app;
    require('express-ws')(app);

    // Init websocket CLI entry point
    app.ws('/cli', function(ws) {
      log.debug("[api] user connected");

      ws.on('message', function(req) {
        req = JSON.parse(req);
        if (Controller[req.action]) {
          Controller[req.action](ws, req.data, req.id);
        } else {
          log.warn('No route found to action', req.action);
        }
      });
    });

    log.debug("[api] added api_ws to api");
  }

  stop() {
    Controller.rsync_watcher.close();
    return Q.resolve();
  }
}

var Controller = {
  get rsync_watcher() {
    if (!this.__rsync_watcher) {
      this.__rsync_watcher = new lazy.Watcher();
    }
    return this.__rsync_watcher;
  },

  watch: function(ws, data, req_id) {
    var host_folder  = data.host_folder;
    var guest_folder = data.guest_folder;
    var opts         = data.opts;

    // TODO: add progress to log single file sync
    this._send(ws, req_id, { status: 'start' });
    this.rsync_watcher.watch(host_folder, guest_folder, opts)
    .then(() => {
      this._send(ws, req_id, { status: 'done' });
    })
    .fail((err) => {
      this._send(ws, req_id, { status: 'fail', err: err});
    });
  },

  unwatch: function(ws, data, req_id) {
    var host_folder  = data.host_folder;
    var guest_folder = data.guest_folder;
    var result = this.rsync_watcher.unwatch(host_folder, guest_folder) ? 'done' : 'fail';
    this._send(ws, req_id, { status: result });
  },

  watchers: function(ws, data, req_id) {
    var result = this.rsync_watcher.wathcers();
    this._send(ws, req_id, result);
  },

  _send: function(ws, id, data) {
    if (!data.id) {
      data.id = id;
    }
    ws.send(JSON.stringify(data));
  }
};
