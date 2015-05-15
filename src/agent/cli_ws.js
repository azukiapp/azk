import { lazy_require, log } from 'azk';

var lazy = lazy_require({
  Rsync      : ['azk/agent/rsync'],
  RsyncWatcher: ['azk/agent/rsync_watcher'],
});

var Router = {
  route(ws, req) {
    if (Controller[req.action]) {
      Controller[req.action](ws, req.data, req.id);
    } else {
      log.warn('No route found to action', req.action);
    }
  }
};

var Controller = {
  watch: function(ws, data, req_id) {
    var host_folder  = data.host_folder;
    var guest_folder = data.guest_folder;
    var opts         = data.opts;

    // TODO: add progress to log single file sync
    this._send(ws, req_id, { status: 'start' });
    console.log('cli_ws.js', opts);
    lazy.RsyncWatcher.watch(host_folder, guest_folder, opts)
    .then(() => {
      console.log('watch then');
      this._send(ws, req_id, { status: 'done' });
    })
    .fail((err) => {
      this._send(ws, req_id, { status: 'fail', err: err});
    });
  },

  unwatch: function(ws, data, req_id) {
    var host_folder  = data.host_folder;
    var guest_folder = data.guest_folder;
    var result = lazy.RsyncWatcher.unwatch(host_folder, guest_folder) ? 'done' : 'fail';
    this._send(ws, req_id, { status: result });
  },

  watchers: function(ws, data, req_id) {
    var result = lazy.RsyncWatcher.wathcers();
    this._send(ws, req_id, result);
  },

  _send: function(ws, id, data) {
    if (!data.id) {
      data.id = id;
    }
    ws.send(JSON.stringify(data));
  }
};

export { Router, Controller };
