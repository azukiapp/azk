var docker = require('../docker');
var azk    = require('../azk');
var Q      = azk.Q;
var _      = azk._;
var debug  = require('debug')('azk:exec');

function action() {
  var args    = _.toArray(arguments);
  var command = _.last(args);

  Q.spawn(function* () {
    var opts =  {
      tty: process.stdout.isTTY,
      stdout: process.stdout,
      stderr: process.stderr,
    };
    if (command.interactive) opts.stdin = process.stdin;
    var container  = yield docker.run(
      'ubuntu:12.04', _.initial(args, 1), opts
    ).progress(function(event) {
      if (event.type == "created") {
        debug("created: %s", event.id);
      }
    });

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
