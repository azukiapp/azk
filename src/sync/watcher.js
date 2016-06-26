import { _, path, log } from 'azk';
import { defer } from 'azk/utils/promises';
import { IPublisher } from 'azk/utils/postal';

var forever = require('forever-monitor');

export class Watcher extends IPublisher {
  constructor() {
    super('sync.watcher');
    this._workers = {};
  }

  watch(origin, destination, opts) {
    var id = this.calculate_id(origin, destination);

    return defer((resolve, reject) => {
      log.info('[sync] Adding watcher',
       '\n      [sync] from:', origin,
       '\n      [sync]   to:', destination);
      if (this.workers[id]) {
        this.workers[id].count++;
        this.publish('init', { status: 'exists' });
        log.info ('[sync] Existing watcher ', id, ', count:', this.workers[id].count);
        log.debug('[sync] Current watchers:', _.keys(this.workers));
        return resolve();
      }

      // Save worker info
      this.workers[id] = {origin, destination, count: 1};

      // Fork process with monitor
      var child = new (forever.Monitor)(`${__dirname}/worker.js`, {
        max: 3,
        env: process.env,
        fork: true,
        killTTL: 10000,
      });

      // Save work process monitor
      this.workers[id].child = child;

      child.on('restart', () => {
        this.publish('restart', { op: 'restart', status: 'init' });
        child.send({origin, destination, opts});
        log.info('[sync] Sync process restarted',
         '\n      [sync] from:', origin,
         '\n      [sync]   to:', destination);
      });

      child.on('exit:code', (code) => {
        var level         = code !== null && code > 0 && code !== 130 ? 'warn' : 'info';
        var with_code_msg = code ? 'with code ' + code : '';

        log[level]('[sync] Sync process exited', with_code_msg,
           '\n      [sync] from:', origin,
           '\n      [sync]   to:', destination);
      });

      child.on('message', (data) => {
        log.debug('[sync] Watcher received message', data);
        data = JSON.parse(data);
        this.publish(data.op, data);

        if (data.op === 'watch') {
          switch (data.status) {
            case 'ready':
              return resolve(true);
          }
        } else if (data.op === "sync") {
          if (data.cmd) {
            log.debug('[sync] Rsync command:\n', data.cmd);
          }

          switch (data.status) {
            case 'done':
              log.info('[sync] Sync completed',
               '\n      [sync] from:', origin,
               '\n      [sync]   to:', destination);
              break;
            case 'fail':
              this.unwatch(origin, destination);
              log.error('[sync] Sync failed:\n', (data.err.stack ? data.err.stack : data.err));
              return reject(data.err);
          }
        }
      });

      child.on('start', (process) => {
        log.debug('[sync] Sync process started with PID', process.childData.pid);
        child.send({ origin, destination, opts });
      });

      child.start();
    });
  }

  unwatch(origin, destination) {
    log.info('[sync] Removing watcher\n      [sync] from:', origin, '\n      [sync]   to:', destination);
    var id     = this.calculate_id(origin, destination);
    var result = this._remove_worker(id);

    if (this.workers[id]) {
      log.info ('[sync] Watcher ', id, ', count:', this.workers[id].count);
    }

    log.debug('[sync] Current watchers:',  _.keys(this.workers));
    this.publish('finish', { op: 'finish', status: 'done' });
    return result;
  }

  get workers() {
    return this._workers;
  }

  get_worker(...args) {
    return this.workers[this.calculate_id(...args)];
  }

  close() {
    _.each(this.workers, (worker, id) => {
      worker.count = 0;
      this._remove_worker(id);
    });
  }

  calculate_id(origin, destination) {
    return JSON.stringify({
      origin: path.resolve(origin),
      destination: path.resolve(destination)
    });
  }

  _remove_worker(id) {
    var worker = this.workers[id];
    if (worker) {
      if (--worker.count <= 0) {
        worker.child.kill(true);
        delete this.workers[id];
      }
    } else {
      id = JSON.parse(id);
      log.info('[sync] Trying to stop an unexisting watcher:', id);
    }
    return true;
  }
}
