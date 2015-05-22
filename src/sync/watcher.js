import { _, path, defer, log } from 'azk';
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
      log.debug('Adding watcher from folder', origin, 'to', destination);
      if (this.workers[id]) {
        this.workers[id].count++;
        this.publish('init', { status: 'exists' });
        log.debug('Current watchers:\n', this.workers);
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
        log.info('[sync] Sync process restarted', { origin, destination });
      });

      child.on('exit:code', (code) => {
        var level = code !== null && code > 0 && code !== 130 ? 'warn' : 'info';
        log[level]('[sync] Sync process exited with code', code, { origin, destination });
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
    log.info('[sync] Removing watcher from folder', origin, 'to', destination);
    var result = this._remove_worker(this.calculate_id(origin, destination));
    log.debug('[sync] Current watchers: ' + _.keys(this.workers));
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
    log.info('[sync] workers ' + _.keys(this.workers));
    log.info('[sync] call to remove worker id ' + id);
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
