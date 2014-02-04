var docker = require('../docker');
var azk    = require('../azk');
var Q      = azk.Q;
var _      = azk._;

function action() {
  var args    = _.toArray(arguments);
  var command = _.last(args);
  var interactive = command.I != null;

  Q.spawn(function* () {
    var container  = yield docker.run(
      'ubuntu:12.04', _.initial(args, 1), { stdin: process.stdin, stdout: process.stdout }
    );

    // Remove executed container
    // TODO: Save the log
    console.log("Removing container: %s", container.id);
    yield Q.ninvoke(container, "remove");

    // End ok
    process.exit(0);
  });
}

module.exports = function(commander) {
  var interactive = azk.t("commands.exec.interactive");
  commander.command('exec')
    .option("-i", "--interactive", interactive, false)
    .description(azk.t('commands.exec.description'))
    .action(action)
}
