var azk      = require('../azk');
var Agent    = require('../agent');
var App      = require('../app');
var detector = require('../detector');
var helpers  = require('../cli/helpers');
var cli      = require('../cli');
var prompt   = require('prompt');
var fs       = require('fs');
var path     = require('path');
var colors   = require('colors');

// Initialize
var debug = azk.debug('azk:init');
var Q = azk.Q;

function run(cwd, out, opts) {
  if (opts.id) {
    console.log(App.new_id());
    return Q(0);
  }

  if (!cwd) cwd = cli.cwd;
  cwd = path.resolve(cwd);

  var manifest = path.join(cwd, azk.cst.MANIFEST);
  if (fs.existsSync(manifest)) {
    out.fail("commands.init.already", manifest.yellow);
    return Q.when(null, function() { throw 1 });
  }

  var detected = detector.inspect(cwd) || {};
  detected.app_id = App.new_id();
  detected.host = path.basename(cwd);

  var generate = function(result) {
    detected.box = result.box;
    detector.render(detected, manifest);
    azk.ok(azk.t("commands.init.generated", path.relative(process.cwd(), manifest)));
    return 0;
  }

  if (!opts.box) {
    prompt.start();
    prompt.message = "Azk".blue;
    var schema = {
      properties: {
        box: {
          description: azk.t("commands.init.enter"),
          default: detected.box,
          required: true,
        }
      }
    };

    return Q.nfcall(prompt.get, schema).then(generate);
  } else {
    return Q(generate({ box: opts.box }));
  }
}

function action(cwd, command) {
  helpers.run_with_log("init", { skip_app: true }, function(app, out) {
    return run(cwd, out, command);
  });
}

module.exports = function(commander) {
  commander.command('init [path]')
    .option("-i, --id", azk.t("commands.init.id"), false)
    .option("-b, --box [box]", azk.t("commands.init.box"))
    .description(azk.t("commands.init.description"))
    .action(action);
}

module.exports.run = run;
