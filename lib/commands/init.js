var azk      = require('../azk');
var Agent    = require('../agent');
var prompt   = require('prompt');
var App      = require('../app');
var fs       = require('fs');
var path     = require('path');
var colors   = require('colors');
var detector = require('../detector');

// Initialize
var debug = azk.debug('azk:init');

function action(cwd, program) {
  if (program.id) {
    console.log(App.new_id());
    process.exit(0);
  }

  if (!cwd) cwd = process.cwd();
  cwd = path.resolve(cwd);

  var manifest = path.join(cwd, azk.cst.MANIFEST)
  if (fs.existsSync(manifest)) {
    console.error("'%s' already exists", manifest.yellow);
    process.exit(1);
  }

  prompt.start();
  var detected = detector.inspect(cwd) || {};

  prompt.message = "Azk".blue;
  var schema = {
    properties: {
      box: {
        description: "Enter the box name",
        default: detected.box,
        required: true,
      }
    }
  }

  prompt.get(schema, function(err, result) {
    detected.box = result.box;
    detector.render(detected, manifest);
    console.info("'%s' generated", manifest);
    process.exit(0);
  });
}

module.exports = function(commander) {
  commander.command('init [path]')
    .option("--id", "Generate a new app id", false)
    .description(azk.t("commands.init.description"))
    .action(action)
}
