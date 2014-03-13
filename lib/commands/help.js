//
// Help
//
var azk     = require('../azk');
var cli     = require('../cli');
var helpers = require('../cli/helpers');
var colors  = require('colors');

var Q     = azk.Q;
var _     = azk._;
var parent = null;

function action(cmd_name) {
  if (!cmd_name) {
    cmd_name = 'help';
  }

  cmd = _.find(parent.commands, function(command) {
    return command._name == cmd_name;
  });

  if (cmd) {
    return cmd.outputHelp();
  }

  var not_found = azk.t('commands.not_found', azk.cst.PREFIX_MSG_ERR, cmd_name);
  console.log(not_found);
  parent.outputHelp();
}

module.exports = function(commander) {
  parent = commander;
  commander.command('help [command]')
    .description(azk.t('commands.help.description'))
    .action(action)
}
