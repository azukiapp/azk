var azk       = require('./azk');
var commander = require('commander');
var pkg       = require('../package.json');
var path      = require('path');

var _ = azk._;
var Q = azk.Q;

var glob = Q.denodeify(require('glob'));

function init() {
  commander.version(pkg.version)
    .usage('[cmd] app');

  // Add commands
  var cmds_path = path.join(__dirname, "./commands/*.js");
  return glob(cmds_path).then(function(files) {
    _.each(files, function(file) {
      require(file)(commander);
    });

    // Catch all
    var not_found = azk.t('commands.not_found', azk.cst.PREFIX_MSG_ERR)
    commander.command('*')
      .action(function() {
        console.log(not_found);
        commander.outputHelp();
        process.exit(azk.cst.ERROR_EXIT);
      });
  });
}

// Init
module.exports = function(argv) {
  azk.init().then(init)
  .then(function() {
    // Display help
    if (process.argv.length == 2) {
      commander.parse(process.argv);
      commander.outputHelp();
      process.exit(azk.cst.ERROR_EXIT);
    }
    commander.parse(argv);
  }
  ).fail(function(err) {
    console.log(err.stack);
  })
}
