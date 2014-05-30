import { Q, path, fs, config, log, defer, async } from 'azk';
import { net } from 'azk/utils';
var forever = require('forever-monitor');

// TODO: Reaplce forever for a better solution :/
var Balancer = {
  memcached: null,
  hipache  : null,

  start() {
    var self = this;
    return async(function* () {
      if (!self.isRunnig()) {
        var socket = config('paths:memcached_socket');
        yield self.start_memcached(socket);
        yield self.start_hipache(socket);
      }
    });
  },

  start_hipache(socket) {
    var port = config('agent:port');
    var pid  = config("paths:hipache_pid");
    var file = this._check_config(port, socket);
    var cmd = [ 'nvm', 'hipache', '--config', file ];

    log.info("starting hipache");
    return this._start_service(cmd, pid).then((child) => {
      this.hipache = child;
      log.info("hipache started in %s port with file config", port, file);
      child.on('stop', () => {
        log.info('hipache stoped');
      });
      child.on('exit:code', (code) => {
        if (code && code != 0) {
          log.error('hipache exit code: ' + code);
        }
      });
      child.on('stdout', (data) => {
        log.info('hipache: %s', data.toString().trim());
      });
      child.on('stderr', (data) => {
        log.info('hipache: %s', data.toString().trim());
      });
    });
  },

  start_memcached(socket) {
    var pid = config("paths:memcached_pid");
    var cmd = [ 'nvm', 'memcachedjs', '--socket', socket ];

    log.info("starting memcachedjs");
    return this._start_service(cmd, pid).then((child) => {
      this.memcached = child;
      log.info("memcachedjs started in socket: ", socket);
      child.on('stop', () => {
        log.info('memcached stoped');
      });
      child.on('exit:code', (code) => {
        if (code && code != 0) {
          log.error('memcached exit code: ' + code);
        }
      });
      child.on('stdout', (data) => {
        log.info('memcached: %s', data.toString().trim());
      });
      child.on('stderr', (data) => {
        log.info('memcached: %s', data.toString().trim());
      });
    });
  },

  stop() {
    var self = this;
    if (this.isRunnig()) {
      log.debug("call to stop balancer");
      return async(function* () {
        yield defer((resolve) => {
          if (self.hipache.running) {
            self.hipache.on('stop', resolve);
            process.kill(self.hipache.pid);
          } else {
            resolve();
          }
        });
        yield defer((resolve) => {
          if (self.memcached.running) {
            self.memcached.on('stop', resolve);
            process.kill(self.memcached.pid);
          } else {
            resolve();
          }
        });
      });
    } else {
      return Q();
    }
  },

  isRunnig() {
    return (this.hipache && this.hipache.running);
  },

  _start_service(cmd, pid) {
    cmd = [path.join(config('paths:azk_root'), 'bin', 'azk'), ...cmd];
    return defer((resolve, reject, notify) => {
      var child = forever.start(cmd, {
        max : 1,
        silent : true,
        pidFile: pid
      });

      child.on('exit:code', () => {
        reject();
        process.kill(process.pid);
      });
      child.on('start', () => resolve(child));
    });
  },

  _check_config(port, memcached_socket) {
    var file   = config('paths:balancer_file');

    var data = {
      server: {
        accessLog: "./data/logs/hipache_access.log",
        workers: 3,
        maxSockets: 100,
        deadBackendTTL: 30
      },
      http: {
        port: port,
        address: ["127.0.0.1", "::1"]
      },
      driver: ["memcached://" + memcached_socket]
    }

    // set content
    fs.writeFileSync(file, JSON.stringify(data, null, '  '));
    return file;
  }
}

export { Balancer }

