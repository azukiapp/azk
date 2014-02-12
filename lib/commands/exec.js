var docker  = require('../docker');
var azk     = require('../azk');
var helpers = require('../cli/helpers');

var Q     = azk.Q;
var _     = azk._;
var debug = azk.debug('azk:exec');

function run(app, args, interactive) {
  // Default volumes
  var volumes = {};
  volumes[app.path] = "/azk/app";

  var _run = docker.run(app.image, args, {
    tty: process.stdout.isTTY,
    stdout: process.stdout,
    stderr: process.stderr,
    stdin: interactive ? process.stdin : null,
    volumes: volumes,
  });

  return _run.progress(function(event) {
    if (event.type == "created") {
      debug("created: %s", event.id);
    }
  });
}

function action() {
  var args    = _.toArray(arguments);
  var command = _.last(args);
  var app = helpers.require_app(process.cwd());

  Q.spawn(function* () {
    // Require app image
    var data = yield docker.findImage(app.image);
    if (!data) helpers.image_not_found(app.image);

    // Run in app image
    var container = yield run(app, _.initial(args, 1), command.interactive);

    // Remove executed container
    // TODO: Save the log
    if (command.remove) {
      debug("removing container: %s", container.id);
      yield Q.ninvoke(container, "remove");
    }

    // End ok
    process.exit(0);
  });
}

module.exports = function(commander) {
  var interactive = azk.t("commands.exec.interactive");
  var remove      = azk.t("commands.exec.remove");

  commander.command('exec')
    .option("-R, --no-remove", remove)
    .option("-i, --interactive", interactive, false)
    .description(azk.t('commands.exec.description'))
    .action(action)
}
