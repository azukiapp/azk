var Agent    = require('../agent');
var docker   = require('../docker');
var azk      = require('../azk');
var vm       = require('../agent/vm');
var helpers  = require('../cli/helpers');


var Q      = azk.Q;
var _      = azk._;
var debug  = azk.debug('azk:agent');

function removeAll() {
  return docker.listContainers({ all: true })
  .then(function(containers) {
    return Q.all(_.map(containers, function(c) {
      c = docker.getContainer(c.Id)
      return Q.ninvoke(c, "kill")
      .then(function() {
        console.log("Removing %s", c.id);
        return Q.ninvoke(c, "remove");
      });
    }))
  });
}

function status() {
  return Q.async(function* () {
    var ab = yield Agent.pingDaemon();
    if (ab == false) {
      azk.fail("Agent not running");
      return helpers.exit(1);
    }

    yield Agent.launchRPC();
    var status = yield Agent.executeRemote("status");
    debug("status: " + JSON.stringify(status));
    helpers.exit(0);
  })();
}

function stop() {
  return Q.async(function* () {
    var status = yield Agent.pingDaemon();

    if (status) {
      debug("connecting the agent");
      yield Agent.launchRPC();
      debug("stopping the agent");
      yield Agent.executeRemote("stop");
      return helpers.exit(0);
    } else {
      azk.fail("agent not runing");
    }
  })()
}

function start(daemon) {
  return Q.async(function* () {
    var status = yield Agent.pingDaemon();

    if (status) {
      azk.fail("agent already started");
      return helpers.exit(0);
    } else {
      debug("starting agent");
      process.on('agent:client:ready', function() {
        azk.ok("agent started");
        return helpers.exit(0);
      });
      Agent.start(!daemon);
    }
  })()
}

function restart() {
  return Q.async(function* () {
    yield stop();

  });
}

function ssh() {
  return vm.ssh(azk.cst.VM_IP);
}

function action(cmd) {
  var args    = _.toArray(arguments);
  var command = _.last(args);

  var result = null;
  switch(cmd) {
    case "removeall":
      result = removeAll().then(helpers.exit, azk.fail);
      break;
    case "status":
      process.env.AZK_DEBUG = "azk:*";
      result = status();
      break;
    case "stop":
      result = stop();
      break;
    case "start":
      process.env.AZK_DEBUG = "azk:*";
      result = start(command.daemon);
      break;
    case "restart":
      result = restart(command.daemon);
      break;
    case "ssh":
      result = ssh();
      break;
  }

  result.fail(console.log);
}

module.exports = function(commander) {
  commander.command('agent <removeall|status|stop|start|ssh>')
    .option("-D, --no-daemon", azk.t("commands.agent.nodaemon"))
    .description(azk.t('commands.agent.description'))
    .action(action)
}
