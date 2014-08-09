import { _, Q, path, fs, config, log, defer, async } from 'azk';
import { net } from 'azk/utils';
import { Tools } from 'azk/agent/tools';
import { AgentStartError } from 'azk/utils/errors';

var url     = require('url');
var forever = require('forever-monitor');
var MemoryStream    = require('memorystream');
var MemcachedDriver = require('memcached');

// TODO: Reaplce forever for a better solution :/
var Balancer = {
  memcached: null,
  hipache  : null,
  mem_client : null,

  get memCached() {
    if (!this.mem_client) {
      var socket = config('paths:memcached_socket');
      this.mem_client = new MemcachedDriver(socket);
    }
    return this.mem_client;
  },

  removeAll(host) {
    var key = 'frontend:' + host;
    return Q.ninvoke(this.memCached, 'delete', key);
  },

  getBackends(host) {
    var key = 'frontend:' + host;
    return Q.ninvoke(this.memCached, 'get', key).then((entries) => {
      return entries ? entries : [host];
    });
  },

  addBackend(hosts, backend) {
    return async(this, function* () {
      for(var host of (_.isArray(hosts) ? hosts : [hosts])) {
        var key = 'frontend:' + host
        var entries = yield this.getBackends(host);
        entries = this._removeEntry(entries, backend);
        entries.push(backend);
        yield Q.ninvoke(this.memCached, 'set', key, entries, 0);
      }
    });
  },

  removeBackend(hosts, backend) {
    return async(this, function* () {
      for(var host of (_.isArray(hosts) ? hosts : [hosts])) {
        var key = 'frontend:' + host;
        var entries = yield this.getBackends(host);
        entries = this._removeEntry(entries, backend);
        yield Q.ninvoke(this.memCached, 'set', key, entries, 0);
      }
    });
  },

  start() {
    return Tools.async_status("balancer", this, function* (change_status) {
      if (!this.isRunnig()) {
        var socket = config('paths:memcached_socket');
        var ip     = net.calculateGatewayIp(config("agent:vm:ip"))
        var port   = yield net.getPort();

        // Memcached
        change_status("starting_memcached");
        yield this.start_memcached(socket);
        change_status("started_memcached");

        // Hipache
        change_status("starting_hipache");
        yield this.start_hipache(ip, port, socket);
        change_status("started_hipache");

        // Dns server
        change_status("starting_dns");
        yield this.start_dns(ip, port);
        change_status("started_dns");

        // Socat
        change_status("starting_socat");
        yield this.start_socat(ip, port);
        change_status("started_socat");
      }
    });
  },

  start_dns(ip, port) {
    return this._runSystem('dns', {
      wait: false,
    });
  },

  start_socat(ip, port) {
    return this._runSystem('balancer-redirect', {
      wait: true,
      envs: {
        BALANCER_IP: ip,
        BALANCER_PORT: port,
      }
    });
  },

  start_hipache(ip, port, socket) {
    var pid  = config("paths:hipache_pid");
    var file = this._check_config(ip, port, socket);
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
    // Remove socket
    if (fs.existsSync(socket)) fs.unlinkSync(socket);
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
    if (this.isRunnig()) {
      log.debug("call to stop balancer");
      return Tools.async_status("balancer", this, function* (change_status) {
        yield defer((resolve) => {
          if (this.hipache && this.hipache.running) {
            change_status("stopping_hipache");
            this.hipache.on('stop', () => {
              change_status("stoped_hipache");
              resolve();
            });
            process.kill(this.hipache.pid);
          } else {
            resolve();
          }
        });
        yield defer((resolve) => {
          if (this.memcached && this.memcached.running) {
            change_status("stopping_memcached");
            this.memcached.on('stop', () => {
              change_status("stoped_memcached");
              resolve();
            });
            process.kill(this.memcached.pid);
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
    return (
      (this.hipache && this.hipache.running) ||
      (this.memcached && this.memcached.running)
    );
  },

  _removeEntry(entries, backend) {
    return _.filter(entries, (entry) => { return entry != backend });
  },

  _getSystem(system) {
    var Manifest = require('azk/manifest').Manifest;
    var manifest = new Manifest(config('paths:azk_root'), true);
    return manifest.system(system, true);
  },

  _waitDocker() {
    var promise = net.waitService(config("docker:host"), 5, { context: "dns" });
    return promise.then((success) => {
      if (!success) {
        throw new AgentStartError(t(errors.not_connect_docker));
      }
      return true;
    });
  },

  _runSystem(system_name, options = {}) {
    return async(this, function* () {
      var system  = this._getSystem(system_name);

      // Wait docker
      yield this._waitDocker();

      // Save outputs to use in error
      var output = "";
      options.stdout = new MemoryStream();
      options.stdout.on('data', (data) => {
        output += data.toString();
      });

      var result = yield system.scale(1, options);
      if (!result) {
        throw new Error('Fail to start balancer: ' + output);
      }
    });
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

  _check_config(ip, port, memcached_socket) {
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
        bind: ["127.0.0.1", ip, "::1"]
      },
      driver: ["memcached://" + memcached_socket]
    }

    // set content
    fs.writeFileSync(file, JSON.stringify(data, null, '  '));
    return file;
  }
}

export { Balancer }

