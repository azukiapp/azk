var docker  = require('../docker');
var azk     = require('../azk');
var cli     = require('../cli');
var helpers = require('../cli/helpers');
var Agent   = require('../agent');
var printf  = require('printf');

var Q     = azk.Q;
var _     = azk._;
var debug = azk.debug('azk:service');

function proxy_add(alias, port_name, container) {
  var backend = printf(
        "http://%s:%s", azk.cst.VM_NAME,
        container.NetworkSettings.Ports[port_name][0].HostPort
      );
  return Agent.executeRemote('proxy_register', alias, backend);
}

function remove_proxy(alias, port, container) {
  var backend = printf(
        "http://%s:%s", azk.cst.VM_NAME,
        container.Ports[0].PublicPort
      );
  return Agent.executeRemote('proxy_remove', alias, backend);
}

function scale(app, out, service, action, instances) {
  // Cmd
  var meta     = app.services[service];
  var log_path = "/azk/logs/" + service + ".log";
  var cmd = [
    "/bin/sh", "-c", meta.command + " >> " + log_path
  ];

  return Q.async(function* () {
    var ns = app.id + ".service." + service;
    var containers = _.filter(yield docker.listContainers(), function(c) {
      return c.Names[0].match(RegExp(ns));
    });

    var from = containers.length;
    var to   = instances - from;

    switch(action) {
      case "status":
        if (from > 0)
          out.ok("commands.service.running", from);
        else
          out.ok("commands.service.not_runnig");
        return 0;
      case "stop":
        to = from * -1;
        out.ok("commands.service.stopping", from);
        break;
      default:
        out.ok("commands.service.scale", from, instances);
    }

    if (to > 0) {
      var opts = _.extend(yield helpers.prepare_app(app), {
        daemon: true,
        ns: ns,
      });

      // Port map
      var port = meta.port || 3000;
      var port_name = port + "/tcp";
      opts.ports[port_name] = [{ HostIp: "0.0.0.0" }];
      opts.env.PORT = port;

      var container;
      for(var i = 0; i < to; i++) {
        container = yield docker.run(app.image, cmd, opts);
        container = yield container.inspect();
        yield proxy_add(app.env.alias, port_name, container);
        out.ok("%s: %s", "created".green, container.Name);
      }
    } else if (to < 0) {
      for(var i = to; i < 0; i++) {
        var container = containers.pop();
        var c = docker.getContainer(container.Id);
        yield remove_proxy(app.env.alias, port, container);
        yield c.kill();
        out.ok("%s: %s", "removed".red, container.Names[0]);
        yield c.remove();
      }
    }

    return 0;
  })();
}

function run(app, out, service, action, instances) {
  return Q.when(null, function() {
    if (!app.services[service]) {
      out.fail("commands.service.invalid_service", service);
      throw 3;
    }

    return scale(app, out, service, action, instances);
  });
}

function action() {
  var args    = _.toArray(arguments);
  var command = args.pop();
  var service = args.shift();
  var action  = args.shift();

  helpers.run_with_log("service", { cwd: cli.cwd }, function(app, out) {
    return run(app, out, service, action, command.instances);
  });
}

module.exports = function(commander) {
  return commander.command('service <name> <start|stop|restart|status>')
    .option("-n, --instances [numer]", azk.t('commands.service.instances'), 1)
    .description(azk.t('commands.service.description'))
    .action(action)
}

module.exports.run = run;
