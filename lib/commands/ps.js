//
// Ps
//
var docker  = require('../docker');
var azk     = require('../azk');
var cli     = require('../cli');
var helpers = require('../cli/helpers');

var Q     = azk.Q;
var _     = azk._;
var debug = azk.debug('azk:ps');

function list(app) {
  console.log('list');
  Q();
}

function action() {
  var args    = _.toArray(arguments);
  var command = _.last(args);
  var app = helpers.require_app(cli.cwd);

  Q.spawn(function* () {
    // Require app image
    var data = yield docker.findImage(app.image);
    if (!data) helpers.image_not_found(app.image);

    // List processs
    yield list(app);

    // End ok
    return helpers.exit(0);
  });
}

module.exports = function(commander) {
  commander.command('ps')
    .description(azk.t('commands.ps.description'))
    .action(action)
}
