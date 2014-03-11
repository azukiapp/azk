var docker  = require('../docker');
var azk     = require('../azk');
var cli     = require('../cli');
var helpers = require('../cli/helpers');

var Q     = azk.Q;
var _     = azk._;
var debug = azk.debug('azk:exec');

function run(app, out, args, opts) {
  // Default volumes
  var volumes = {};
  volumes[app.path] = "/azk/app";

  var _run = docker.run(app.image, args, {
    tty: opts.isTTY || process.stdout.isTTY,
    stdout: opts.stdout || process.stdout,
    stderr: opts.stderr || process.stderr,
    stdin: opts.interactive ? (opts.stdin || process.stdin) : null,
    volumes: volumes,
    working_dir: volumes[app.path],
    env: app.env.env,
  });

  return _run.progress(function(event) {
    out.log("%s: %s", event.type, event.id);
  }).then(function(container) {
    return Q.ninvoke(container, "inspect").then(function(data) {
      var result = 0;

      // TODO: Save the log
      if (opts.remove) {
        out.log("removing container: %s", container.id);
        result = Q.ninvoke(container, "remove");
      }

      return Q.when(result, function() { return data.State.ExitCode });
    });
  });
}

function action() {
  var args    = _.toArray(arguments);
  var command = args.pop();

  helpers.run_with_log("exec", { cwd: cli.cwd }, function(app, out) {
    return run(app, out, args, command);
  });
}

module.exports = function(commander) {
  commander.command('exec')
    .option("-R, --no-remove", azk.t("commands.exec.remove"))
    .option("-i, --interactive", azk.t("commands.exec.interactive"), false)
    .description(azk.t('commands.exec.description'))
    .action(action)
}

module.exports.run = run;
