'use strict';

/**
 * Dependencies
 */

var rpc  = require('axon-rpc');
var axon = require('axon');
var rep  = axon.socket('rep');
var req  = axon.socket('req');
var pub  = axon.socket('pub-emitter');

var debug = require('debug')('azk:agent');
var util  = require('util');
var fs    = require('fs');

var azk  = require('../azk');
var cst  = azk.cst;
var Q    = azk.Q;
var _    = azk._;

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
  Agent.pingDaemon().then(function(ab) {
    // If Daemon not alive
    if (ab == false) {
      if (noDaemonMode) {
        return Agent.processWrapper();
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
  var Api = require('./api');

  function gracefullExit() {
    Api.stop().then(function() {
      console.log('azk has been killed by signal');
      try {
        fs.unlinkSync(cst.AZK_PID_FILE_PATH);
      } catch(e){}
      process.exit(0);
    }).fail(console.error);
  }
  try {
    fs.writeFileSync(cst.AZK_PID_FILE_PATH, process.pid);
  } catch(e){}

  process.on('SIGTERM', gracefullExit);
  process.on('SIGINT', gracefullExit);
  process.on('SIGQUIT', gracefullExit);
};

Agent.processWrapper = function() {
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

  Agent.remoteWrapper().then(function() {
    // Send ready message to Agent Client
    if (typeof(process.send) === 'function') {
      process.send({
        online : true, success : true, pid : process.pid
      });
    }
  }).fail(function(err) {
    console.log(err);
  });
};

/**
 * External interaction part
 */

/**
 * Rep/Req - RPC system to interact with Api
 */

Agent.remoteWrapper = function() {
  // Only require here because Api init himself
  var Api = require('./api');

  return Api.init().then(function() {
    var server = new rpc.Server(rep);

    var msg    = 'Daemon lauched bind on port %s addr %s';
    debug(msg, cst.DAEMON_RPC_PORT, cst.DAEMON_BIND_HOST);
    rep.bind(cst.DAEMON_RPC_PORT, cst.DAEMON_BIND_HOST);

    // Map methods to expose
    server.expose(_.reduce(Api, function(memo, method, name) {
      if (name.match(/^ex_.*/)) {
        memo[name.replace(/^ex_/, '')] = method;
      }
      return memo;
    }, {}));

    /**
     * Pub system for real time notifications
     */
    var msg = 'Daemon lauched bind on port %s addr %s';
    debug(msg, cst.DAEMON_PUB_PORT, cst.DAEMON_BIND_HOST);
    pub.bind(cst.DAEMON_PUB_PORT, cst.DAEMON_BIND_HOST);

    Api.bus.onAny(function(data) {
      debug(this.event);
      pub.emit(this.event, data);
    });
  });
};

/**
 *
 * Client part
 *
 */

/**
 * Launch the Daemon by forking this same file
 * The method Agent.processWrapper will be called
 *
 * @param {Function} Callback
 * @api public
 */

Agent.launchDaemon = function(cb) {
  var done = Q.defer();
  debug('Launching daemon');

  var child = require('child_process').fork(__filename, [], {
    silent     : false,
    detached   : true,
    cwd        : process.cwd(),
    env        : util._extend({
      'SILENT' : cst.DEBUG ? !cst.DEBUG : true,
      'HOME'   : process.env.HOME,
      'DEBUG'  : '*',
    }, process.env),
    stdio      : 'ignore'
  }, function(err, stdout, stderr) {
    if (err) console.error(err);
    debug(arguments);
  });

  child.unref();

  child.once('message', function(msg) {
    process.emit('agent:daemon:ready');
    //console.log(msg);
    return setTimeout(function() {
      done.resolve();
      cb(null, child)
    }, 100);
  });

  return done.promise;
};

/**
 * Ping the daemon to know if it alive or not
 *
 * @param {Function} Callback
 * @api public
 */

Agent.pingDaemon = function() {
  var done   = Q.defer();
  var req    = axon.socket('req');
  var client = new rpc.Client(req);

  debug('Trying to connect to server');
  client.sock.once('reconnect attempt', function() {
    client.sock.close();
    debug('Daemon not launched');
    done.resolve(false);
  });
  client.sock.once('connect', function() {
    client.sock.close();
    debug('Daemon alive');
    done.resolve(true);
  });
  req.connect(cst.DAEMON_RPC_PORT, cst.DAEMON_BIND_HOST);

  return done.promise;
};

/**
 * Methods to interact with the Daemon via RPC
 * This method wait to be connected to the Daemon
 * Once he's connected it trigger the command parsing (on ./bin/azk file, at the end)
 */
Agent.launchRPC = function() {
  var done = Q.defer();

  debug('Launching RPC client on port %s %s', cst.DAEMON_RPC_PORT, cst.DAEMON_BIND_HOST);
  Agent.client = new rpc.Client(req);
  Agent.ev = req.connect(cst.DAEMON_RPC_PORT, cst.DAEMON_BIND_HOST);
  Agent.ev.on('connect', function() {
    debug('Connected to Daemon');
    done.resolve();
    process.emit('agent:client:ready');
  });

  return done.promise;
};

Agent.getExposedMethods = function(cb) {
  return Q.ninvoke(Agent.client, "methods");
  Agent.client.methods(cb);
};

Agent.executeRemote = function(method, env) {
  var args = _.toArray(arguments);
  return Q.npost(Agent.client, "call", args);
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
  Agent.processWrapper();
}
