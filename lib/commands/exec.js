var docker = require('../docker');
var azk    = require('../azk');
var Q      = azk.Q;
var _      = azk._;
var debug  = require('debug')('azk:exec');
var App    = require('../app');

function box_not_found() {
  console.error(
    azk.t("app.box.not_found", azk.cst.MANIFEST)
  );
  process.exit(1);
}

function image_not_found(image) {
  console.error(
    azk.t("app.image.not_provision", image)
  );
  process.exit(2);
}

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

  var app = new App(process.cwd());

  if (!app.file) box_not_found();

  Q.spawn(function* () {
    // Require app image
    var data = yield docker.findImage(app.image);
    if (!data) image_not_found(app.image);

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
