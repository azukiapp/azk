import { _, defer, log } from 'azk';

var child_process = require('child_process');
// var forever = require('forever-monitor');

var RsyncWatcher = {
  _workers: [],

  watch(host_folder, guest_folder, opts) {
    return defer((resolve, reject, notify) => {
      var existing_worker = this._get_worker(host_folder, guest_folder);
      if (existing_worker) {
        ++existing_worker.count;
        console.log(this._workers);
        return resolve();
      }

      var worker_info = {host_folder, guest_folder, count: 1};
      this._workers.push(worker_info);

      // var worker = new (forever.Monitor)(`${__dirname}/rsync_worker.js`, {
      //   'max': 10,
      //   'minUptime': 1,
      //   'spinSleepTime': 5000,
      //   'spawnWith': { customFds: [0, 'pipe', 'pipe'] },
      // });

      var worker = child_process.fork(`${__dirname}/rsync_worker.js`, { stdio: [ 0, 'pipe', 'pipe'] });

      // worker.on('restart', () => {
      //   log.warn('Sync process restarted');
      //   log.warn('  Host folder:', host_folder);
      //   log.warn('  Guest folder:', guest_folder);
      // });

      // worker.on('exit:code', (code) => {
      //   log.warn('Sync process exited with code' + code);
      //   log.warn('  Host folder:', host_folder);
      //   log.warn('  Guest folder:', guest_folder);
      // });

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

      // worker.start();

      worker_info.pid = worker.pid;
      worker.send({host_folder, guest_folder, opts});

      console.log(this._workers);
    });
  },

  unwatch(host_folder, guest_folder) {
    console.log('unwatch', host_folder, guest_folder);
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
      log.warn('  Host folder:', host_folder);
      log.warn('  Guest folder:', guest_folder);
    }
    return true;
  },

};

export { RsyncWatcher };
