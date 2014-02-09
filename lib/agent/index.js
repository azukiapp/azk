'use strict';

/**
 * Dependencies
 */

var rpc  = require('axon-rpc');
var axon = require('axon');
var rep  = axon.socket('rep');
var req  = axon.socket('req');
var pub  = axon.socket('pub-emitter');

var debug  = require('debug')('azk:agent');
var util   = require('util');
var fs     = require('fs');
//var p      = require('path');

var azk  = require('../azk');
var cst  = azk.cst;
var Q    = azk.Q;

/**
 * Export
 */

var Agent = module.exports = {};

/**
 * This function ensures that daemon is running and start it if it doesn't
 *
 * @api public
 */

Agent.start = function(noDaemonMode) {
  Agent.pingDaemon(function(ab) {
    // If Daemon not alive
    if (ab == false) {
      if (noDaemonMode) {
        return Agent.remoteWrapper();
      }

      // Daemonize
      return Agent.launchDaemon(function(err, child) {
        if (err) {
          console.error(err);
          process.exit(cst.ERROR_EXIT);
        }
        Agent.launchRPC();
      });
    }
    return Agent.launchRPC();
  });
};

/**
 *
 * Daemon part
 *
 */
Agent.processStateHandler = function() {
  function gracefullExit() {
    console.log('azk has been killed by signal');
    try {
      fs.unlinkSync(cst.AZK_PID_FILE_PATH);
    } catch(e){}
    process.exit(0);
  }
  try {
    fs.writeFileSync(cst.AZK_PID_FILE_PATH, process.pid);
  } catch(e){}

  process.on('SIGTERM', gracefullExit);
  process.on('SIGINT', gracefullExit);
  process.on('SIGQUIT', gracefullExit);
};

Agent.remoteWrapper = function() {
  Agent.processStateHandler();

  if (process.env.SILENT == 'true') {
    // Redirect output to files
    var stdout = fs.createWriteStream(cst.AZK_LOG_FILE_PATH, {
      flags : 'a'
    });

    process.stderr.write = function(string) {
      stdout.write(new Date().toISOString() + ' : ' + string);
    };

    process.stdout.write = function(string) {
      stdout.write(new Date().toISOString() + ' : ' + string);
    };
  }

  // Only require here because Api init himself
  var Api = require('./api');

  // Send ready message to Agent Client
  if (typeof(process.send) === 'function') {
    process.send({
      online : true, success : true, pid : process.pid
    });
  }

  /**
   * External interaction part
   */

  /**
   * Rep/Req - RPC system to interact with Api
   */

  var server = new rpc.Server(rep);

  debug('Daemon lauched bind on port %s addr %s', cst.DAEMON_RPC_PORT, cst.DAEMON_BIND_HOST);
  rep.bind(cst.DAEMON_RPC_PORT, cst.DAEMON_BIND_HOST);

  server.expose({
    ping : Api.ping,
  });

  /**
   * Pub system for real time notifications
   */

  debug('Daemon lauched bind on port %s addr %s', cst.DAEMON_PUB_PORT, cst.DAEMON_BIND_HOST);
  pub.bind(cst.DAEMON_PUB_PORT, cst.DAEMON_BIND_HOST);

  Api.bus.onAny(function(data) {
    debug(this.event);
    pub.emit(this.event, data);
  });

};

/**
 *
 * Client part
 *
 */

/**
 * Launch the Daemon by forking this same file
 * The method Agent.remoteWrapper will be called
 *
 * @param {Function} Callback
 * @api public
 */

Agent.launchDaemon = function(cb) {
  debug('Launching daemon');

  var child = require('child_process').fork(__filename, [], {
    silent     : false,
    detached   : true,
    cwd        : process.cwd(),
    env        : util._extend({
      'SILENT' : cst.DEBUG ? !cst.DEBUG : true,
      'HOME'   : process.env.HOME
    }, process.env),
    stdio      : 'ignore'
  }, function(err, stdout, stderr) {
    if (err) console.error(err);
    debug(arguments);
  });

  child.unref();

  child.once('message', function(msg) {
    process.emit('agent:daemon:ready');
    console.log(msg);
    return setTimeout(function() {cb(null, child)}, 100);
  });
};

/**
 * Ping the daemon to know if it alive or not
 *
 * @param {Function} Callback
 * @api public
 */

Agent.pingDaemon = function(cb) {
  var req = axon.socket('req');
  var client = new rpc.Client(req);

  debug('Trying to connect to server');
  client.sock.once('reconnect attempt', function() {
    client.sock.close();
    debug('Daemon not launched');
    cb(false);
  });
  client.sock.once('connect', function() {
    client.sock.close();
    debug('Daemon alive');
    cb(true);
  });
  req.connect(cst.DAEMON_RPC_PORT, cst.DAEMON_BIND_HOST);
};

/**
 * Methods to interact with the Daemon via RPC
 * This method wait to be connected to the Daemon
 * Once he's connected it trigger the command parsing (on ./bin/azk file, at the end)
 */
Agent.launchRPC = function() {
  debug('Launching RPC client on port %s %s', cst.DAEMON_RPC_PORT, cst.DAEMON_BIND_HOST);
  Agent.client = new rpc.Client(req);
  Agent.ev = req.connect(cst.DAEMON_RPC_PORT, cst.DAEMON_BIND_HOST);
  Agent.ev.on('connect', function() {
    debug('Connected to Daemon');
    process.emit('agent:client:ready');
  });
};

Agent.getExposedMethods = function(cb) {
  return Q.ninvoke(Agent.client, "methods");
  Agent.client.methods(cb);
};

Agent.executeRemote = function(method, env) {
  return Q.ninvoke(Agent.client, "call", method, env);
};

Agent.killDaemon = function() {
  return Agent.executeRemote('killMe', {});
};

//
// If this file is a main process, it means that
// this process is being forked by azk itself
//
if (require.main === module) {
  process.title = 'azk: Agent Daemonizer';
  Agent.remoteWrapper();
}
