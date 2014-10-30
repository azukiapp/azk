import { Q, fs, path, config, log, defer, async } from 'azk';
import { net } from 'azk/utils';

var ssh2 = require('ssh2');
var scp2 = require('scp2').Client;
var ssh_timeout = 10000;

export class SSH {
  constructor(host, port) {
    this.host = host;
    this.port = port;
  }

  exec(cmd, wait = false) {
    return this.connect(wait, (client, done) => {
      log.debug("agent vm ssh cmd: %s", cmd);
      done.notify({ type: "ssh", context: "running", cmd: cmd});

      client.exec(cmd, (err, stream) => {
        if (err) return done.reject(err);
        stream.on('data', (data, extended) => {
          var context = extended ? extended : 'stdout';
          done.notify({ type: "ssh", context, data });
        });

        stream.on('end', () => { client.end(); });
        stream.on('exit', (code) => { client.exitcode = code });
      });
    });
  }

  escapeShell(cmd) {
    return '"'+ cmd.replace(/(["\s'$`\\])/g, '\\$1') + '"';
  }

  putFile(origin, dest, wait = false) {
    return this.connect(wait, (client, done) => {
      log.debug("agent vm ssh scp: %s => %s", origin, dest);
      done.notify({ type: "ssh", context: "scp", origin, dest});

      client.sftp((err, sftp) => {
        if (err) return done.reject(err);
        var scp = new scp2();
        scp.__sftp = sftp;

        scp.upload(origin, dest, (err) => {
          if (err) return done.reject(err);
          done.resolve(0);
          process.nextTick(() => client.end());
        });
      });
    });
  }

  connect(wait, callback) {
    var execute = () => {
      return defer((done) => {
        var client    = new ssh2();
        var exit_code = 0;
        var options   = {
          host: this.host,
          port: this.port,
          username: config("agent:vm:user"),
          readyTimeout: ssh_timeout,
          password: config("agent:vm:password"),
        };

        client.on("ready", () => {
          done.notify({ type: 'connected' });
          log.debug("agent vm ssh connected");
          callback(client, done);
        });

        client.on('end', () => { done.resolve(client.exitcode); });
        client.on('error', (err) => { done.reject(err); });

        client.connect(options);
      });
    }

    // TODO: change timeout and attempts for a logic value
    if (wait) {
      return net.waitForwardingService(this.host, this.port, 15).then(() => {
        return execute();
      });
    } else {
      return execute();
    }
  }
}
