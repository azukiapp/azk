import { _, defer, log } from 'azk';
import { IPublisher } from 'azk/utils/postal';

// var child_process = require('child_process');
var forever = require('forever-monitor');

export class Watcher extends IPublisher {
  constructor() {
    super('sync.watcher');
    this._workers = [];
  }

  watch(origin, destination, opts) {
    return defer((resolve, reject) => {
      log.debug('Adding watcher from folder', origin, 'to', destination);
      var existing_worker = this._get_worker(origin, destination);
      if (existing_worker) {
        ++existing_worker.count;
        this.publish('init', { status: 'exists' });
        log.debug('Current watchers:\n', this.workers);
        return resolve();
      }

      var worker_info = {origin, destination, count: 1};
      this.workers.push(worker_info);

      var child = new (forever.Monitor)(`${__dirname}/worker.js`, {
        max: 3,
        env: { AZK_DEBUG: 'true' },
        fork: true,
        killTTL: 10000,
      });

      worker_info.child = child;

      child.on('restart', () => {
        this.publish('restart', { op: 'restart', status: 'init' });
        child.send({origin, destination, opts});
        log.warn('[sync] Sync process restarted');
        log.warn('[sync]   Host folder:', origin);
        log.warn('[sync]   Guest folder:', destination);
      });

      child.on('exit:code', (code) => {
        log.warn('[sync] Sync process exited with code', code);
        log.warn('[sync]   Host folder:', origin);
        log.warn('[sync]   Guest folder:', destination);
      });

      child.on('message', (data) => {
        log.debug('[sync] Watcher received message', data);
        data = JSON.parse(data);
        this.publish(data.op, data);
        if (data.op === "watch" && data.status === 'ready') {
          return resolve(true);
        } else if (data.op === "sync" && data.status === "fail") {
          this.unwatch(origin, destination);
          return reject(data.err);
        }
      });

      child.on('start', (process) => {
        log.debug('[sync] process started with pid', process);
        child.send({origin, destination, opts});
      });

      child.start();
    });
  }

  unwatch(origin, destination) {
    log.info('Removing watcher from folder', origin, 'to', destination);
    var result = this._remove_worker(origin, destination);
    log.debug('Current watchers:\n', this._workers);
    this.publish('finish', { op: 'finish', status: 'done' });
    return result;
  }

  get workers() {
    return this._workers;
  }

  close() {
    while (this.workers.length > 0) {
      var worker = this.workers.pop();
      this._kill_worker(worker.child);
    }
  }

  _get_worker(origin, destination) {
    return _.find(this.workers, (worker) => {
      return worker.origin === origin &&
            worker.destination === destination;
    });
  }

  _remove_worker(origin, destination) {
    var worker = this._get_worker(origin, destination);
    if (worker) {
      if (--worker.count === 0) {
        this._kill_worker(worker.child);
        this.workers.splice(this.workers.indexOf(worker), 1);
      }
    } else {
      log.info('[sync] Trying to stop an unexisting watcher:');
      log.info('[sync]   Host folder:', origin);
      log.info('[sync]   Guest folder:', destination);
    }
    return true;
  }

  _kill_worker(child) {
    child.kill(true);
  }
}
