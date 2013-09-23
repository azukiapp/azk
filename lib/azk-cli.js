var commander = require('commander');

var AzkCli = function(program) {
  var program = program || commander;

  return {
    version: function(version) {
      program.version(version);
      return this;
    },
    command: function(command) {
      new command(program);
      return this;
    },
    runWithArgs: function(args) {
      program.parse(args);
      return program.args;
    }
  }
}

module.exports = AzkCli
