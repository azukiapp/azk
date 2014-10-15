"use strict";
var __moduleName = "src/agent/ssh";
var $__2 = require('azk'),
    Q = $__2.Q,
    fs = $__2.fs,
    path = $__2.path,
    config = $__2.config,
    log = $__2.log,
    defer = $__2.defer,
    async = $__2.async;
var net = require('azk/utils').net;
var ssh2 = require('ssh2');
var scp2 = require('scp2').Client;
var ssh_timeout = 10000;
var SSH = function SSH(host, port) {
  this.host = host;
  this.port = port;
};
($traceurRuntime.createClass)(SSH, {
  exec: function(cmd) {
    var wait = arguments[1] !== (void 0) ? arguments[1] : false;
    return this.connect(wait, (function(client, done) {
      log.debug("agent vm ssh cmd: %s", cmd);
      done.notify({
        type: "ssh",
        context: "running",
        cmd: cmd
      });
      client.exec(cmd, (function(err, stream) {
        if (err)
          return done.reject(err);
        stream.on('data', (function(data, extended) {
          var context = extended ? extended : 'stdout';
          done.notify({
            type: "ssh",
            context: context,
            data: data
          });
        }));
        stream.on('exit', (function(code) {
          log.debug("agent vm ssh result: %s", code);
          done.resolve(code);
          process.nextTick((function() {
            return client.end();
          }));
        }));
      }));
    }));
  },
  escapeShell: function(cmd) {
    return '"' + cmd.replace(/(["\s'$`\\])/g, '\\$1') + '"';
  },
  putFile: function(origin, dest) {
    var wait = arguments[2] !== (void 0) ? arguments[2] : false;
    return this.connect(wait, (function(client, done) {
      log.debug("agent vm ssh scp: %s => %s", origin, dest);
      done.notify({
        type: "ssh",
        context: "scp",
        origin: origin,
        dest: dest
      });
      client.sftp((function(err, sftp) {
        if (err)
          return done.reject(err);
        var scp = new scp2();
        scp.__sftp = sftp;
        scp.upload(origin, dest, (function(err) {
          if (err)
            return done.reject(err);
          done.resolve(0);
          process.nextTick((function() {
            return client.end();
          }));
        }));
      }));
    }));
  },
  connect: function(wait, callback) {
    var $__0 = this;
    var execute = (function() {
      return defer((function(done) {
        var client = new ssh2();
        var exit_code = 0;
        var options = {
          host: $__0.host,
          port: $__0.port,
          username: config("agent:vm:user"),
          readyTimeout: ssh_timeout,
          password: config("agent:vm:password")
        };
        client.on("ready", (function() {
          done.notify({type: 'connected'});
          log.debug("agent vm ssh connected");
          callback(client, done);
        }));
        client.on('end', (function() {
          done.resolve();
        }));
        client.on('error', (function(err) {
          done.reject(err);
        }));
        client.connect(options);
      }));
    });
    if (wait) {
      return net.waitForwardingService(this.host, this.port, 15).then((function() {
        return execute();
      }));
    } else {
      return execute();
    }
  }
}, {});
module.exports = {
  get SSH() {
    return SSH;
  },
  __esModule: true
};
//# sourceMappingURL=ssh.js.map