var commander = require('commander');
var pkg       = require('../package.json');
var glob      = require('glob');
var path      = require('path');
var _         = require('underscore');
var cst       = require('../constants.js');

var i18n      = require('i18n');

i18n.configure({
  defaultLocale: 'en',
  directory: path.join(__dirname, "../locales")
});

commander.version(pkg.version)
  .usage('[cmd] app');

// Add commands
var files = glob.sync(path.join(__dirname, "./commands/*.js"))
_.each(files, function(file) {
  require(file)(commander);
});

// Catch all
commander.command('*')
  .action(function() {
    console.log(i18n.__("not_found", cst.PREFIX_MSG_ERR ));
    commander.outputHelp();
    process.exit(cst.ERROR_EXIT);
  });

// Init
module.exports = function(argv) {
  // Display help
  if (process.argv.length == 2) {
    commander.parse(process.argv);
    commander.outputHelp();
    process.exit(cst.ERROR_EXIT);
  }

  commander.parse(argv);
}
