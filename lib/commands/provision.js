var docker  = require('../docker');
var azk     = require('../azk');
var cli     = require('../cli');
var helpers = require('../cli/helpers');

var Q     = azk.Q;
var _     = azk._;
var debug = azk.debug('azk:provision');

function run(app, out, opts) {
  return Q.async(function* () {

    var data = yield docker.findImage(app.image);
    if (data && !opts.force) {
      out.fail("app.image.already", app.image);
      throw 1;
    }

    // Remove old
    // TODO: related services
    if (data) {
      out.log("commands.provision.removing", app.image);
      yield docker.getImage(app.image).remove();
    }

    // Force ancestors
    if (!opts.force) {
      var data = yield docker.findImage(app.from.image);
      if (!data)
        opts.force = true;
    }

    yield app.provision(opts, opts.stdout || process.stdout);

    return 0;
  })()
  .progress(function(event) {
    if (event && event.type == "provisioned") {
      out.log("app.image.provisioned", event.image)
    }
  });
}

function action() {
  var args    = _.toArray(arguments);
  var command = args.pop();

  helpers.run_with_log("provision", { skip_image: true, cwd: cli.cwd }, function(app, out) {
    return run(app, out, command);
  });
}

module.exports = function(commander) {
  commander.command('provision')
    .option("-F, --force", azk.t("commands.provision.force"))
    .option("-C, --no-cache", azk.t("commands.provision.cache"))
    .description(azk.t('commands.provision.description'))
    .action(action)
}

module.exports.run = run;
