var azk    = require('../azk');
var prompt = require('prompt');

// Initialize

function action(cmd, program) {
  prompt.start();

  prompt.message = "Azk".blue;
  var schema = {
    properties: {
      box: {
        description: "Enter the box name",
        default: "xyz",
        required: true,
      }
    }
  }

  prompt.get(schema, function(err, result) {
    console.log(err, result)
  });
}

module.exports = function(commander) {
  commander.command('init [path]')
    .option("--id", "Generate a new app id", false)
    .description(azk.t("commands.init.description"))
    .action(action)
}
