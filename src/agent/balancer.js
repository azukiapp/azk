import { _, Q, t, path, fs, config, log, defer, async } from 'azk';
import { lazy_require } from 'azk';
import { net } from 'azk/utils';
import { Tools } from 'azk/agent/tools';
import { AgentStartError } from 'azk/utils/errors';

var url     = require('url');
var forever = require('forever-monitor');
var MemoryStream    = require('memorystream');
var MemcachedDriver = require('memcached');

lazy_require(this, {
  Manifest: ['azk/manifest'],
  Client  : ['azk/agent/client'],
});

// TODO: Reaplce forever for a better solution :/
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

  // Balancer service and subsystems controll
  start(vm_enabled = true) {
    return Tools.async_status("balancer", this, function* (change_status) {
      if (!this.isRunnig()) {
        var socket = config('paths:memcached_socket');
        var ip     = net.calculateGatewayIp(config("agent:vm:ip"))
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

  start_dns(ip, port) {
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
    var pid  = config("paths:hipache_pid");
    var file = this._check_config(ip, port, socket);
    var cmd = [ 'nvm', 'hipache', '--config', file ];
    var name = "hipache";

    return this._start_service(name, cmd, pid).then((child) => {
      this.hipache = child;
      log.info("hipache started in %s port with file config", port, file);
      this._handleChild(name, child);
    });
  },

  start_memcached(socket) {
    var pid  = config("paths:memcached_pid");
    var cmd  = [ 'nvm', 'memcachedjs', '--socket', socket ];
    var name = "memcached";

    // Remove socket before start
    // TODO: replace by q-io
    if (fs.existsSync(socket)) fs.unlinkSync(socket);

    return this._start_service(name, cmd, pid).then((child) => {
      this.memcached = child;
      log.info("memcachedjs started in socket: ", socket);
      this._handleChild(name, child);
    });
  },

  stop() {
    if (this.isRunnig()) {
      log.debug("call to stop balancer");
      return Tools.async_status("balancer", this, function* (change_status) {
        yield Q.all([
          this._stop_system('balancer-redirect', change_status),
          this._stop_system('dns', change_status),
        ]);
        yield this._stop_sub_service("hipache", change_status);
        yield this._stop_sub_service("memcached", change_status);
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
    var manifest = new Manifest(config('paths:shared'), true);
    return manifest.system(system, true);
  },

  _waitDocker() {
    var docker_host = config("docker:host");
    var promise = net.waitService(docker_host, 5, { timeout: 1000, context: "balancer" });
    return promise.then((success) => {
      if (!success) {
        throw new AgentStartError(t('errors.not_connect_docker'));
      }
      return true;
    });
  },

  // TODO: check if system is running
  _run_system(system_name, options = {}) {
    return Tools.async_status("balancer", this, function* (change_status) {
      if (this.running[system_name]) return true;
      var system = this._getSystem(system_name);

      // Wait docker
      yield this._waitDocker();

      // Save outputs to use in error
      var output = "";
      options.stdout = new MemoryStream();
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
      if (!this.running[system_name]) return false;

      var system = this._getSystem(system_name);

      // Wait docker
      yield this._waitDocker();

      // Stop
      change_status("stopping_" + system_name);
      yield system
        .stop()
        .catch((err) => {
          try {
            log.error(err);
            change_status("error", err);
          } catch(err) {}
          return true;
        });
      change_status("stoped_" + system_name);

      // Save state
      this.running[system_name] = false;
    });
  },

  _handleChild(name, child) {
    child.on('stop', () => {
      log.info(name + ' stoped');
    });

    // Log child erro if exited
    child.on('exit:code', (code) => {
      if (code && code != 0) {
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
      max : 1,
      silent : true,
      pidFile: pid
    }

    return Tools.defer_status("balancer", (resolve, reject, change_status) => {
      // Log and notify
      log.info("starting " + name);
      change_status("starting_" + name);

      var child = forever.start(cmd, options);
      child.on('exit', () => {
        reject();
        Client.stop();
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
          change_status("stoped_" + sub);
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
    }

    // set content
    fs.writeFileSync(file, JSON.stringify(data, null, '  '));
    return file;
  }
}

export { Balancer }

