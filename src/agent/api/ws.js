import { lazy_require, log } from 'azk';
import { promiseResolve } from 'azk/utils/promises';

// Hotswap configure
module.change_code = 1;
if (!module.cache) { module.cache = {}; }
module.change_code = function(oldmod, newmod) {
  newmod.cache = oldmod.cache;
  newmod.cache.reload = true;
};

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
    if (!module.cache.reload) {
      Controller.rsync_watcher.close();
    } else {
      delete module.cache.reload;
    }
    return promiseResolve();
  }
}

var Controller = {
  get rsync_watcher() {
    if (!module.cache.rsync_watcher) {
      module.cache.rsync_watcher = new lazy.Watcher();
    }
    return module.cache.rsync_watcher;
  },

  watch(ws, data, req_id) {
    var host_folder  = data.host_folder;
    var guest_folder = data.guest_folder;
    var opts         = data.opts;

    // TODO: add log single file sync
    this._send(ws, req_id, { status: 'start' });
    this.rsync_watcher.watch(host_folder, guest_folder, opts)
    .then(() => {
      this._send(ws, req_id, { status: 'done' });
    })
    .catch((err) => {
      this._send(ws, req_id, { status: 'fail', err: err});
    });
  },

  unwatch(ws, data, req_id) {
    var host_folder  = data.host_folder;
    var guest_folder = data.guest_folder;
    try {
      var result = this.rsync_watcher.unwatch(host_folder, guest_folder) ? 'done' : 'fail';
      this._send(ws, req_id, { status: result });
    } catch (err) {
      this._logError(err);
      this._send(ws, req_id, { status: 'fail' });
    }
  },

  watchers(ws, data, req_id) {
    var result = this.rsync_watcher.wathcers();
    this._send(ws, req_id, result);
  },

  _send(ws, id, data) {
    if (!data.id) {
      data.id = id;
    }
    try {
      ws.send(JSON.stringify(data));
    } catch (err) {
      this._logError(err);
    }
  },

  _logError(err) {
    let keys  = ["message", "arguments", "type", "name", ...Object.keys(err)];
    let error = JSON.stringify(err, keys);
    log.error("send websocket error %s", error, {});
  }
};
