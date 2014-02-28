var docker = require('../docker');
var azk    = require('../azk');
var helpers = require('../cli/helpers');

var Q     = azk.Q;
var _     = azk._;
var debug = azk.debug('azk:provision');

function action() {
  var args    = _.toArray(arguments);
  var command = _.last(args);
  var app = helpers.require_app(process.cwd());

  Q.spawn(function* () {
    // Require app image
    var data = yield docker.findImage(app.image);
    if (data && !command.force) {
      console.error(azk.t("app.image.already", app.image));
      process.exit(1);
    }

    // Remove old
    // TODO: related services
    if (data) {
      debug(azk.t("commands.provision.removing", app.image));
      yield docker.getImage(app.image).remove();
    }

    // Force ancestors
    if (!command.force) {
      var data = yield docker.findImage(app.from.image);
      if (!data)
        command.force = true;
    }

    var image = yield app.provision({
      cache: command.cache,
      force: command.force,
    }, process.stdout)
    .progress(function(event) {
      if (event && event.type == "provisioned") {
        debug(azk.t("app.image.provisioned", event.image));
      }
    });

    // End ok
    process.exit(0);
  });
}

module.exports = function(commander) {
  var force = azk.t("commands.provision.force");
  var cache = azk.t("commands.provision.cache");

  commander.command('provision')
    .option("-F, --force", force)
    .option("-C, --no-cache", cache)
    .description(azk.t('commands.provision.description'))
    .action(action)
}
