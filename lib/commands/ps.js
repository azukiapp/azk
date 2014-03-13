//
// Ps
//
var docker  = require('../docker');
var azk     = require('../azk');
var cli     = require('../cli');
var helpers = require('../cli/helpers');
var colors  = require('colors');

var Q     = azk.Q;
var _     = azk._;
var debug = azk.debug('azk:ps');

function run(app, out, opts) {
  var table = 'table_ps';
  var columns = ['Type'.yellow, 'Up time'.green, 'Command'.cyan];

  if (opts.dead) {
    columns.unshift('Status'.red);
  }

  columns.unshift('Azk id'.blue)
  out.table_add(table, { head: columns });

  return docker.listContainers({ all: opts.dead }).then(function(containers) {
    containers = _.filter(containers, function(container) {
      return container.Image == app.image;
    });

    containers = _.sortBy(containers, function(container) {
      return container.Created * -1;
    });

    var rows = _.map(containers, function(container) {
      var names   = container.Names[0].split('.');
      var type    = names[2] + ': ' + names[3];
      var command = container.Command.replace(/>.*$/, '');

      var row  = [ type, container.Status, command ];
      if (opts.dead) {
        row.unshift(container.Status.match(/^Exit/) ? 'dead'.red : 'runnig'.green);
      }
      row.unshift(container.Id.slice(0, 12));

      return row;
    });
    rows.unshift(table);
    out.table_push.apply(out, rows);
    out.table_show(table);
  });
}

function action() {
  var args    = _.toArray(arguments);
  var command = args.pop();

  helpers.run_with_log("ps", { cwd: cli.cwd }, function(app, out) {
    return run(app, out, command);
  });
}

module.exports = function(commander) {
  commander.command('ps')
    .option("-d, --dead", azk.t('commands.ps.dead'), false)
    .description(azk.t('commands.ps.description'))
    .action(action)
}

module.exports.run = run;
