var docker = require('../docker');
var azk    = require('../azk');
var Q      = azk.Q;
var _      = azk._;

var createContainer = Q.nbind(docker.createContainer, docker);

function new_resize(container) {
  return function() {
    var dimensions = {
      h: process.stdout.rows,
      w: process.stderr.columns
    }

    if (dimensions.h != 0 && dimensions.w != 0) {
      container.resize(dimensions, function() {})
    }
  }
}

// Initialize
function run(optsc) {
  return Q.async(function* () {
    var container = yield createContainer(optsc);
    var cattach   = Q.nbind(container.attach, container);
    var cstart    = Q.nbind(container.start, container);
    var cwait     = Q.nbind(container.wait, container);

    // Resize tty
    var resize = new_resize(container);
    var isRaw = process.isRaw;
    var attach_opts = {
      log: true, stream: true,
      stdin: optsc.AttachStdin, stdout: true, stderr: true
    }

    var stream = yield cattach(attach_opts);
    if (optsc.AttachStdin) {
      stream.pipe(process.stdout);
    } else {
      container.modem.demuxStream(stream,
        process.stdout, process.stderr);
    }

    // Connect stdin
    if (optsc.AttachStdin) {
      process.stdin.resume();
      process.stdin.setRawMode(true)
      process.stdin.pipe(stream);
    }

    // Start container
    yield cstart();
    if (optsc.AttachStdin) {
      resize();
      process.stdout.on('resize', resize);
    }

    // Wait container
    yield cwait();
    if (optsc.AttachStdin) {
      process.stdout.removeListener('resize', resize);
      process.stdin.removeAllListeners();
      process.stdin.setRawMode(isRaw);
      process.stdin.resume();
      stream.end();
    }
    return container;
  })();
}

function action() {
  var args    = _.toArray(arguments);
  var command = _.last(args);
  var interactive = command.I != null;

  var optsc = {
    Image: 'ubuntu:12.04',
    Cmd: _.initial(args, 1),
    'AttachStdin': interactive,
    'AttachStdout': true,
    'AttachStderr': true,
    'Tty': interactive,
    'OpenStdin': true,
  }

  Q.spawn(function* () {
    var container = yield run(optsc);

    console.log("Removing container: %s", container.id);
    yield Q.ninvoke(container, "remove");

    // End ok
    process.exit(0);
  });
}

module.exports = function(commander) {
  var interactive = azk.t("commands.exec.interactive");
  commander.command('exec')
    .option("-i", "--interactive", interactive, false)
    .description(azk.t('commands.exec.description'))
    .action(action)
}
