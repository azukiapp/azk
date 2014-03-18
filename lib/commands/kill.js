//
// Ps
//
var docker  = require('../docker');
var azk     = require('../azk');
var cli     = require('../cli');
var helpers = require('../cli/helpers');
var colors  = require('colors');

var Q     = azk.Q;
var _     = azk._;
var debug = azk.debug('azk:kill');

function run(app, out, pid) {
  var container = docker.getContainer(pid);
  return Q.async(function* () {
    var data = yield container.inspect();

    if (data) {
      yield container.kill();
    }

    return 0;
  })().fail(function(err) {
    if (err.statusCode == 404) return 1;
    throw err;
  });
}

function action(pid) {
  var args    = _.toArray(arguments);
  var command = args.pop();

  helpers.run_with_log("kill", { cwd: cli.cwd }, function(app, out) {
    return run(app, out, pid);
  });
}

module.exports = function(commander) {
  commander.command('kill <azk pid>')
    .description(azk.t('commands.kill.description'))
    .action(action)
}

module.exports.run = run;
