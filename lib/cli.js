var azk       = require('./azk');
var commander = require('commander');
var pkg       = require('../package.json');
var path      = require('path');
var Agent     = require('./agent');

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

    commander.on("--help", function() {
      console.log("  See `%s` for information on a specific command.", "azk help <command>".yellow);
      console.log("  For full documentation, see: %s", "http://azk.io".blue);
    });
  });
}

// Init
module.exports = function(rawArgv) {
  azk.init().then(init)
  .then(function() {
    // Display help
    if (rawArgv.length == 2) {
      commander.parse(rawArgv);
      commander.outputHelp();
      process.exit(azk.cst.ERROR_EXIT);
    }

    // Special case
    if (rawArgv[2] == "exec") {
      var finded = false;
      var argv = _.reduce(_.rest(rawArgv, 3), function(memo, arg) {
        if (!finded && arg[0] != "-") {
          memo = memo.concat(["--"]);
          finded = true;
        }
        return memo.concat([arg]);
      }, _.first(rawArgv, 3));
    } else {
      var argv = rawArgv;
    }

    var done = Q.defer();

    process.on('agent:client:ready', function() {
      done.resolve(Q.fcall(function() {
        commander.parse(argv);
      }));
    });

    Agent.start();
    return done.promise;
  }
  ).fail(function(err) {
    console.log(err.stack);
  })
}
