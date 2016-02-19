import { _, t, path, fsAsync, config, log } from 'azk';
import { async, defer, promisifyAll, thenAll, promiseResolve } from 'azk/utils/promises';

import { lazy_require } from 'azk';
import { net } from 'azk/utils';
import { Tools } from 'azk/agent/tools';
import { AgentStartError } from 'azk/utils/errors';

var lazy = lazy_require({
  forever        : 'forever-monitor',
  Manifest       : ['azk/manifest'],
  Client         : ['azk/agent/client'],
  MemoryStream   : 'memorystream',
  MemcachedDriver: 'memcached',
});

// TODO: Replace forever for a better solution :/
var Balancer = {
  memcached : null,
  hipache   : null,
  mem_client: null,

  running: {
    dns: false,
    'balancer-redirect': false,
  },

  // Hipache database controll
  get memCached() {
    if (!this.mem_client) {
      var socket = config('paths:memcached_socket');
      this.mem_client = new lazy.MemcachedDriver(socket);
      this.mem_client = promisifyAll(this.mem_client);
    }
    return this.mem_client;
  },

  removeAll(host) {
    var key = 'frontend:' + host;
    return this.memCached.deleteAsync(key);
  },

  getBackends(host) {
    var key = 'frontend:' + host;
    return this.memCached.getAsync(key).then((entries) => {
      return entries ? entries : [host];
    });
  },

  addBackend(hosts, backend) {
    return async(this, function* () {
      for (var host of (_.isArray(hosts) ? hosts : [hosts])) {
        var key = 'frontend:' + host;
        var entries = yield this.getBackends(host);
        entries = this._removeEntry(entries, backend);
        entries.push(backend);
        yield this.memCached.setAsync(key, entries, 0);
      }
    });
  },

  removeBackend(hosts, backend) {
    return async(this, function* () {
      for (var host of (_.isArray(hosts) ? hosts : [hosts])) {
        var key = 'frontend:' + host;
        var entries = yield this.getBackends(host);
        entries = this._removeEntry(entries, backend);
        yield this.memCached.setAsync(key, entries, 0);
      }
    });
  },

  // Balancer service and subsystems controll
  start(vm_enabled = true) {
    return Tools.async_status("balancer", this, function* () {
      if (!this.isRunnig()) {
        var socket = config('paths:memcached_socket');
        var ip     = net.calculateGatewayIp(config("agent:vm:ip"));
        var port   = yield net.getPort();

        if (vm_enabled) {
          // Subsistems : dns and balancer redirect
          yield this.start_dns(ip, port);
          yield this.start_redirect(ip, port);
        }

        // Memcached and Hipache
        yield this.start_memcached(socket);
        yield this.start_hipache(vm_enabled ? ip : null, port, socket);
      }
    });
  },

  start_dns() {
    return this._run_system('dns', {
      wait: false,
    });
  },

  start_redirect(ip, port) {
    return this._run_system('balancer-redirect', {
      wait: true,
      envs: {
        BALANCER_IP: ip,
        BALANCER_PORT: port,
      }
    });
  },

  start_hipache(ip, port, socket) {
    return async(this, function* () {
      var pid  = config("paths:hipache_pid");
      var file = yield this._check_config(ip, port, socket);
      var cmd  = [ 'nvm', 'hipache', '--config', file ];
      var name = "hipache";
      var child = yield this._start_service(name, cmd, pid);
      this.hipache = child;
      log.info("hipache started in %s port with file config", port, file);
      this._handleChild(name, child);
      return promiseResolve({});
    });
  },

  start_memcached(socket) {
    return async(this, function* () {
      var pid  = config("paths:memcached_pid");
      var cmd  = [ 'nvm', 'memcachedjs', '--socket', socket ];
      var name = "memcached";

      // Remove socket before start
      var socket_exists = yield fsAsync.exists(socket);
      if (socket_exists) {
        yield fsAsync.unlink(socket);
      }

      var child = yield this._start_service(name, cmd, pid);
      this.memcached = child;
      log.info("memcachedjs started in socket: ", socket);
      this._handleChild(name, child);
      return promiseResolve({});
    });
  },

  stop(skip_containers = false) {
    if (this.isRunnig()) {
      log.debug("call to stop balancer");
      return Tools.async_status("balancer", this, function* (change_status) {
        if (!skip_containers) {
          yield thenAll([
            this._stop_system('balancer-redirect', change_status),
            this._stop_system('dns', change_status),
          ]);
        }
        yield this._stop_sub_service("hipache", change_status);
        yield this._stop_sub_service("memcached", change_status);
      });
    } else {
      return promiseResolve();
    }
  },

  isRunnig() {
    return (
      (this.hipache && this.hipache.running) ||
      (this.memcached && this.memcached.running)
    );
  },

  _removeEntry(entries, backend) {
    return _.filter(entries, (entry) => { return entry != backend; });
  },

  _getSystem(system) {
    var manifest = new lazy.Manifest(config('paths:shared'), true);
    return manifest.system(system, true);
  },

  _waitDocker(timeout_max = 20000) {
    var docker_host = config("docker:host");
    var promise = net.waitService(docker_host, {
      timeout: timeout_max,
      context: "balancer",
      publish_retry: false,
    });
    return promise.then((success) => {
      if (!success) {
        throw new AgentStartError(t('errors.connect_docker_unavailable'));
      }
      return success;
    });
  },

  // TODO: check if system is running
  _run_system(system_name, options = {}) {
    return Tools.async_status("balancer", this, function* (change_status) {
      if (this.running[system_name]) {
        return true;
      }
      var system = this._getSystem(system_name);

      // Wait docker
      yield this._waitDocker();

      // Save outputs to use in error
      var output = "";
      options.stdout = new lazy.MemoryStream();
      options.stdout.on('data', (data) => {
        output += data.toString();
      });

      yield system.stop();
      change_status("starting_" + system_name);
      var result = yield system.scale(1, options);

      if (!result) {
        throw new Error(`Fail to start balancer (${system_name}): ${output}`);
      }

      // Save state
      change_status("started_" + system_name);
      this.running[system_name] = true;
    });
  },

  _stop_system(system_name, change_status) {
    return async(this, function* () {
      if (!this.running[system_name]) {
        return false;
      }

      var system = this._getSystem(system_name);

      // Wait docker
      try {
        yield this._waitDocker(30000);

        // Stop
        change_status("stopping_" + system_name);
        yield system
          .stop()
          .catch((err) => {
            try {
              log.error(err);
              change_status("error", err);
            } catch (err) {}
            return true;
          });
        change_status("stopped_" + system_name);
      } catch (err) {
        var msg = err.stack ? err.stack : err.toString();
        log.warn(`[agent] Error to stop balance system ${system_name}`, msg);
      }

      // Save state
      this.running[system_name] = false;
    });
  },

  _handleChild(name, child) {
    child.on('stop', () => {
      log.info(name + ' stopped');
    });

    // Log child error if exited
    child.on('exit:code', (code) => {
      if (code && code !== 0) {
        log.error(name + ' exit code: ' + code);
      }
    });

    // Log child outpus
    var info = (data) => {
      log.info(name + ': %s', data.toString().trim());
    };
    child.on('stdout', info);
    child.on('stderr', info);
  },

  _start_service(name, cmd, pid) {
    cmd = [path.join(config('paths:azk_root'), 'bin', 'azk'), ...cmd];
    var options = {
      max    : 1,
      silent : true,
      fork   : true,
      pidFile: pid,
      detached: false,
    };

    return Tools.defer_status("balancer", (resolve, reject, change_status) => {
      // Log and post msgs
      log.info("starting " + name);
      change_status("starting_" + name);

      var child = lazy.forever.start(cmd, options);
      child.on('exit', () => {
        reject();
        lazy.Client.stop();
      });
      child.on('start', () => resolve(child));

      change_status("started_" + name);
    });
  },

  _stop_sub_service(sub, change_status) {
    return defer((resolve) => {
      var service = this[sub];
      if (service && service.running) {

        change_status("stopping_" + sub);
        service.on('stop', () => {
          change_status("stopped_" + sub);
          resolve();
        });

        service.on('exit', () => {
          change_status("exited_" + sub);
          resolve();
        });

        service.kill();
      } else {
        resolve();
      }
    });
  },

  _check_config(ip, port, memcached_socket) {
    var file = config('paths:balancer_file');
    var log  = path.join(config('paths:logs'), "hipache_access.log");
    var bind = ["127.0.0.1", "::1"];

    // Only ip not a null
    if (ip) { bind.push(ip); }

    var data = {
      user: process.getuid(),
      server: {
        accessLog: log,
        workers: 3,
        maxSockets: 100,
        deadBackendTTL: 30
      },
      http: { port, bind },
      driver: ["memcached://" + memcached_socket]
    };

    // set content
    return fsAsync.writeFile(file, JSON.stringify(data, null, '  ')).then(function () {
      return file;
    });
  }
};

export { Balancer };
