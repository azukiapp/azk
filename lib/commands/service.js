var docker  = require('../docker');
var azk     = require('../azk');
var cli     = require('../cli');
var helpers = require('../cli/helpers');

var Q     = azk.Q;
var _     = azk._;
var debug = azk.debug('azk:service');

function scale(app, out, service, action, instances) {
  // Cmd
  var meta     = app.services[service];
  var log_path = "/azk/logs/" + service + ".log";
  var cmd = [
    "/bin/sh", "-c", meta.command + " > " + log_path
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
        instances = 0;
        out.log("commands.service.stopping", from);
        break;
      default:
        out.log("commands.service.scale", from, instances);
    }

    if (to > 0) {
      var opts = _.extend(yield helpers.prepare_app(app), {
        daemon: true,
        ns: ns,
      });

      // Port map
      var port = meta.port || 3000;
      opts.ports[port + "/tcp"] = [{ HostIp: "0.0.0.0" }];
      opts.env.PORT = port;

      var progress = function(event) {
        if (event.type == "created") {
          out.log("created: %s", event.id);
        }
      }

      return yield Q.all(_.map(_.range(to), function() {
        return docker.run(app.image, cmd, opts).progress(progress);
      }));
    } else if (to < 0) {
      return yield Q.all(_.map(_.range(to, 0), function() {
        var id = containers.pop().Id;
        var c  = docker.getContainer(id);
        return c.kill().then(function() {
          out.log("removed: %s", id);
          return c.remove();
        });
      }))
    }
  })();
}

function run(app, out, service, action, instances) {
  return Q.when(null, function() {
    if (!app.services[service]) {
      out.fail("command.service.invalid_service", service);
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
  commander.command('service <name> <start|stop|restart|status>')
    .option("-n, --instances [numer]", azk.t('commands.service.instances'), 1)
    .description(azk.t('commands.service.description'))
    .action(action)
}

module.exports.run = run;
