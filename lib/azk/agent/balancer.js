"use strict";
var __moduleName = "src/agent/balancer";
var $__3 = require('azk'),
    _ = $__3._,
    Q = $__3.Q,
    path = $__3.path,
    fs = $__3.fs,
    config = $__3.config,
    log = $__3.log,
    defer = $__3.defer,
    async = $__3.async;
var net = require('azk/utils').net;
var Tools = require('azk/agent/tools').Tools;
var AgentStartError = require('azk/utils/errors').AgentStartError;
var url = require('url');
var forever = require('forever-monitor');
var MemoryStream = require('memorystream');
var MemcachedDriver = require('memcached');
var Balancer = {
  memcached: null,
  hipache: null,
  mem_client: null,
  get memCached() {
    if (!this.mem_client) {
      var socket = config('paths:memcached_socket');
      this.mem_client = new MemcachedDriver(socket);
    }
    return this.mem_client;
  },
  getBackends: function(host) {
    var key = 'frontend:' + host;
    return Q.ninvoke(this.memCached, 'get', key).then((function(entries) {
      return entries ? entries : [host];
    }));
  },
  addBackend: function(hosts, backend) {
    var self = this;
    return async(function() {
      var $__1,
          $__2,
          host,
          key,
          entries;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__1 = (_.isArray(hosts) ? hosts : [hosts])[Symbol.iterator]();
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = (!($__2 = $__1.next()).done) ? 13 : -2;
              break;
            case 13:
              host = $__2.value;
              $ctx.state = 14;
              break;
            case 14:
              key = 'frontend:' + host;
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = 2;
              return self.getBackends(host);
            case 2:
              entries = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              entries = self._removeEntry(entries, backend);
              entries.push(backend);
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 6;
              return Q.ninvoke(self.memCached, 'set', key, entries, 0);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  removeBackend: function(hosts, backend) {
    var self = this;
    return async(function() {
      var $__1,
          $__2,
          host,
          key,
          entries;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__1 = (_.isArray(hosts) ? hosts : [hosts])[Symbol.iterator]();
              $ctx.state = 8;
              break;
            case 8:
              $ctx.state = (!($__2 = $__1.next()).done) ? 13 : -2;
              break;
            case 13:
              host = $__2.value;
              $ctx.state = 14;
              break;
            case 14:
              key = 'frontend:' + host;
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = 2;
              return self.getBackends(host);
            case 2:
              entries = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              entries = self._removeEntry(entries, backend);
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 6;
              return Q.ninvoke(self.memCached, 'set', key, entries, 0);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  _removeEntry: function(entries, backend) {
    return _.filter(entries, (function(entry) {
      return entry != backend;
    }));
  },
  start: function() {
    return Tools.async_status("balancer", this, function(change_status) {
      var socket,
          ip,
          port;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = (!this.isRunnig()) ? 21 : -2;
              break;
            case 21:
              socket = config('paths:memcached_socket');
              ip = net.calculateGatewayIp(config("agent:vm:ip"));
              $ctx.state = 22;
              break;
            case 22:
              $ctx.state = 2;
              return net.getPort();
            case 2:
              port = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              change_status("starting_memcached");
              $ctx.state = 24;
              break;
            case 24:
              $ctx.state = 6;
              return this.start_memcached(socket);
            case 6:
              $ctx.maybeThrow();
              $ctx.state = 8;
              break;
            case 8:
              change_status("started_memcached");
              change_status("starting_hipache");
              $ctx.state = 26;
              break;
            case 26:
              $ctx.state = 10;
              return this.start_hipache(ip, port, socket);
            case 10:
              $ctx.maybeThrow();
              $ctx.state = 12;
              break;
            case 12:
              change_status("started_hipache");
              change_status("starting_dns");
              $ctx.state = 28;
              break;
            case 28:
              $ctx.state = 14;
              return this.start_dns(ip, port);
            case 14:
              $ctx.maybeThrow();
              $ctx.state = 16;
              break;
            case 16:
              change_status("started_dns");
              change_status("starting_socat");
              $ctx.state = 30;
              break;
            case 30:
              $ctx.state = 18;
              return this.start_socat(ip, port);
            case 18:
              $ctx.maybeThrow();
              $ctx.state = 20;
              break;
            case 20:
              change_status("started_socat");
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  start_dns: function(ip, port) {
    return async(this, function() {
      var Manifest,
          manifest,
          system,
          address,
          success,
          stdout,
          output,
          result;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              Manifest = require('azk/manifest').Manifest;
              manifest = new Manifest(config('paths:azk_root'), true);
              system = manifest.system('dns', true);
              address = url.parse(config("docker:host"));
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = 2;
              return net.waitService(address.hostname, address.port, 5, {context: "dns"});
            case 2:
              success = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              if (!success) {
                throw new AgentStartError(t(errors.not_connect_docker));
              }
              stdout = new MemoryStream();
              output = "";
              stdout.on('data', (function(data) {
                output += data.toString();
              }));
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 6;
              return system.scale(1, stdout, true);
            case 6:
              result = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              if (!result) {
                throw new Error('Fail to start balancer: ' + output);
              }
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  start_socat: function(ip, port) {
    return async(this, function() {
      var Manifest,
          manifest,
          system,
          address,
          success,
          stdout,
          output,
          result;
      return $traceurRuntime.generatorWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              Manifest = require('azk/manifest').Manifest;
              manifest = new Manifest(config('paths:azk_root'), true);
              system = manifest.system('balancer_redirect', true);
              system.add_env('BALANCER_IP', ip);
              system.add_env('BALANCER_PORT', port);
              address = url.parse(config("docker:host"));
              $ctx.state = 10;
              break;
            case 10:
              $ctx.state = 2;
              return net.waitService(address.hostname, address.port, 5, {context: "socat"});
            case 2:
              success = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              if (!success) {
                throw new AgentStartError(t(errors.not_connect_docker));
              }
              stdout = new MemoryStream();
              output = "";
              stdout.on('data', (function(data) {
                output += data.toString();
              }));
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = 6;
              return system.scale(1, stdout, true);
            case 6:
              result = $ctx.sent;
              $ctx.state = 8;
              break;
            case 8:
              if (!result) {
                throw new Error('Fail to start balancer: ' + output);
              }
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    });
  },
  start_hipache: function(ip, port, socket) {
    var $__0 = this;
    var pid = config("paths:hipache_pid");
    var file = this._check_config(ip, port, socket);
    var cmd = ['nvm', 'hipache', '--config', file];
    log.info("starting hipache");
    return this._start_service(cmd, pid).then((function(child) {
      $__0.hipache = child;
      log.info("hipache started in %s port with file config", port, file);
      child.on('stop', (function() {
        log.info('hipache stoped');
      }));
      child.on('exit:code', (function(code) {
        if (code && code != 0) {
          log.error('hipache exit code: ' + code);
        }
      }));
      child.on('stdout', (function(data) {
        log.info('hipache: %s', data.toString().trim());
      }));
      child.on('stderr', (function(data) {
        log.info('hipache: %s', data.toString().trim());
      }));
    }));
  },
  start_memcached: function(socket) {
    var $__0 = this;
    if (fs.existsSync(socket))
      fs.unlinkSync(socket);
    var pid = config("paths:memcached_pid");
    var cmd = ['nvm', 'memcachedjs', '--socket', socket];
    log.info("starting memcachedjs");
    return this._start_service(cmd, pid).then((function(child) {
      $__0.memcached = child;
      log.info("memcachedjs started in socket: ", socket);
      child.on('stop', (function() {
        log.info('memcached stoped');
      }));
      child.on('exit:code', (function(code) {
        if (code && code != 0) {
          log.error('memcached exit code: ' + code);
        }
      }));
      child.on('stdout', (function(data) {
        log.info('memcached: %s', data.toString().trim());
      }));
      child.on('stderr', (function(data) {
        log.info('memcached: %s', data.toString().trim());
      }));
    }));
  },
  stop: function() {
    if (this.isRunnig()) {
      log.debug("call to stop balancer");
      return Tools.async_status("balancer", this, function(change_status) {
        var $__0;
        return $traceurRuntime.generatorWrap(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $__0 = this;
                $ctx.state = 10;
                break;
              case 10:
                $ctx.state = 2;
                return defer((function(resolve) {
                  if ($__0.hipache && $__0.hipache.running) {
                    change_status("stopping_hipache");
                    $__0.hipache.on('stop', (function() {
                      change_status("stoped_hipache");
                      resolve();
                    }));
                    process.kill($__0.hipache.pid);
                  } else {
                    resolve();
                  }
                }));
              case 2:
                $ctx.maybeThrow();
                $ctx.state = 4;
                break;
              case 4:
                $ctx.state = 6;
                return defer((function(resolve) {
                  if ($__0.memcached && $__0.memcached.running) {
                    change_status("stopping_memcached");
                    $__0.memcached.on('stop', (function() {
                      change_status("stoped_memcached");
                      resolve();
                    }));
                    process.kill($__0.memcached.pid);
                  } else {
                    resolve();
                  }
                }));
              case 6:
                $ctx.maybeThrow();
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, this);
      });
    } else {
      return Q();
    }
  },
  isRunnig: function() {
    return ((this.hipache && this.hipache.running) || (this.memcached && this.memcached.running));
  },
  _start_service: function(cmd, pid) {
    cmd = $traceurRuntime.spread([path.join(config('paths:azk_root'), 'bin', 'azk')], cmd);
    return defer((function(resolve, reject, notify) {
      var child = forever.start(cmd, {
        max: 1,
        silent: true,
        pidFile: pid
      });
      child.on('exit:code', (function() {
        reject();
        process.kill(process.pid);
      }));
      child.on('start', (function() {
        return resolve(child);
      }));
    }));
  },
  _check_config: function(ip, port, memcached_socket) {
    var file = config('paths:balancer_file');
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
    };
    fs.writeFileSync(file, JSON.stringify(data, null, '  '));
    return file;
  }
};
;
module.exports = {
  get Balancer() {
    return Balancer;
  },
  __esModule: true
};
//# sourceMappingURL=balancer.js.map