var docker = require('../docker');
var azk    = require('../azk');
var Q      = azk.Q;

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
  return createContainer(optsc).then(function(container) {
    var cattach = Q.nbind(container.attach, container);
    var cstart  = Q.nbind(container.start, container);
    var cwait   = Q.nbind(container.wait, container);

    // Resize tty
    var resize = new_resize(container);
    var isRaw = process.isRaw;
    var attach_opts = {
      log: true, stream: true, stdin: true, stdout: true, stderr: true
    }

    return cattach(attach_opts)
      .then(function(stream) {
        // Show outputs
        stream.pipe(process.stdout);

        // Connect stdin
        process.stdin.resume();
        process.stdin.setRawMode(true)
        process.stdin.pipe(stream);

        return stream;
      })
      .then(function(stream) {
        return cstart().then(function() {
          resize();
          process.stdout.on('resize', resize);
          return stream;
        });
      })
      .then(function(stream) {
        return cwait().then(function() {
          process.stdout.removeListener('resize', resize);
          process.stdin.removeAllListeners();
          process.stdin.setRawMode(isRaw);
          process.stdin.resume();
          stream.end();

          return container;
        });
      });
  });
}

function action(cmd, program) {
  var optsc = {
    Image: 'ubuntu:12.04',
    Cmd: [ '/bin/bash' ],
    //Cmd: [ '/bin/bash', '-c', 'ls -l /' ],
    'AttachStdin': true,
    'AttachStdout': true,
    'AttachStderr': true,
    'Tty': true,
    'OpenStdin': true,
  }

  return run(optsc).then(function(container) {
    console.log(container);
    process.exit();
  }).fail(function(err) {
    console.log(err.stack);
  })
}

module.exports = function(commander) {
  commander.command('exec <cmd>')
    .option("-i", "--interactive", "Run command in interactive", false)
    .description(azk.t('commands.exec.description'))
    .action(action)
}
