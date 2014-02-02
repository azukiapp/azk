var docker = require('../docker');
var azk    = require('../azk');
var Q      = azk.Q;
var _      = azk._;

var listContainers = Q.nbind(docker.listContainers, docker);

function removeAll() {
  return listContainers({ all: true })
  .then(function(containers) {
    return Q.all(_.map(containers, function(c) {
      c = docker.getContainer(c.Id)
      return Q.ninvoke(c, "stop", { t: 1 })
      .then(function() {
        console.log("Removing %s", c.id);
        return Q.ninvoke(c, "remove");
      });
    }))
  });
}

function action(cmd) {
  if (cmd == "removeall")
    removeAll().fail(azk.fail);
}

module.exports = function(commander) {
  commander.command('agent <removeall>')
    .description(azk.t('commands.agent.description'))
    .action(action)
}
