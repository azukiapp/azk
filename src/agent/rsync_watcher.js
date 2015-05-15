import { _, defer, log } from 'azk';

var child_process = require('child_process');

var RsyncWatcher = {
  _workers: [],

  watch(host_folder, guest_folder, opts) {
    return defer((resolve, reject, notify) => {
      console.log('rsync_watcher.js', opts);
      console.log(host_folder, guest_folder);
      if (this._get_worker(host_folder, guest_folder)) {
        return resolve();
      }

      this._workers.push({host_folder, guest_folder, count: 1});
      var worker = child_process.fork(`${__dirname}/rsync_worker.js`, { stdio: [ 0, 'pipe', null] });
      this._get_worker(host_folder, guest_folder).pid = worker.pid;
      worker.on('message', (data) => {
        console.log('server message', data);
        data = JSON.parse(data);
        switch (data.op) {
          case 'sync':
            data.status === 'done' ? resolve() : reject();
            break;
          case 'added':
          case 'changed':
          case 'deleted':
            notify(_.merge({ type: "sync" }, data));
        }
      });
      worker.send({host_folder, guest_folder, opts});
      console.log('workers', this._workers);
    });
  },

  unwatch(host_folder, guest_folder) {
    return this._remove_worker(host_folder, guest_folder);
  },

  watchers() {
    return this._workers;
  },

  _get_worker(host_folder, guest_folder) {
    return _.find(this._workers, (worker) => {
      return worker.host_folder === host_folder &&
            worker.guest_folder === guest_folder;
    });
  },

  _remove_worker(host_folder, guest_folder) {
    var worker = this._get_worker(host_folder, guest_folder);
    if (worker) {
      if (--worker.count === 0) {
        try {
          process.kill(worker.pid);
        }
        catch (e) {
          if (e.code === 'ESRCH') {
            console.log('Trying to kill unexisting process', worker.pid);
          } else {
            throw e;
          }
        }
        this._workers.splice(this._workers.indexOf(worker), 1);
      }
    } else {
      log.warn('Trying to unwatch an unexisting watcher:');
      log.warn('  host_folder:', host_folder);
      log.warn('  guest_folder:', guest_folder);
    }
    return true;
  },

};

export { RsyncWatcher };
