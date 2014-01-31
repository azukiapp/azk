var docker = require('../docker');
var Q      = require('q');
var HttpDuplex = require('http-duplex-client');
var tty = require('tty');

// Initialize

function action(cmd, program) {
  //docker.run('ubuntu:12.04', ['/bin/bash'], process.stdout, function(err, data, container) {
    //console.log(data.StatusCode);
  //});

  var run_opts = {
    Image: 'ubuntu:12.04',
    Cmd: [ '/bin/bash' ],
    //Cmd: [ '/bin/bash', '-c', 'ls -l /' ],
    'AttachStdin': true,
    'AttachStdout': true,
    'AttachStderr': true,
    'Tty': true,
    'OpenStdin': true,
  }

  Q.ninvoke(docker, "createContainer", run_opts)
  .then(function(container) {
    var deferred = Q.defer();
    var address = "/containers/" + container.id + "/attach?log=1&stream=1&stdout=1&stdin=true&stderr=true"
    var optionsf = {
      //host: '127.0.0.42',
      //port: 80,
      socketPath: "/tmp/docker.sock",
      path: address,
      method: 'POST'
    };

    optionsf.headers = {}
    optionsf.headers['Content-Type']   = 'plain/text'
    optionsf.headers['Content-Length'] = 0

    var req = new HttpDuplex(optionsf)

    req.on('response', function(resp) {
      req.pipe(process.stdout);

      var isRaw = process.isRaw;
      process.stdin.resume();
      process.stdin.setRawMode(true)
      //process.stdin.pipe(req.req)
      process.stdin.on('data', function (data) {
        req.req.write(data);
      })

      deferred.resolve({
        container: container,
        end: function() {
          req.unpipe();
          process.stdin.removeAllListeners();
          process.stdin.setRawMode(isRaw);
          process.stdin.resume();
          req.req.end();
        }
      })
    })

    req.req.write("\n");

    return deferred.promise;
  })
  .then(function(result) {
    return Q.ninvoke(result.container, "start").then(function(data) {
      var resize = function() {
        console.log("resize");
        result.container.resize({ h: process.stdout.rows, w: process.stderr.columns }, function(err, data) {
          if (err) {
            deferred.reject(err)
          }
        })
      }
      resize();
      process.stdout.on('resize', resize);
      return result;
    });
  })
  .then(function(result) {
    return Q.ninvoke(result.container, "wait").then(function(data) {
      result.end();
      return result.container;
    });
  })
  .then(function(container) {
    return Q.ninvoke(container, "remove");
  })
  .fail(function(err) {
    console.err(err);
  })
  .fin(function() {
    process.exit(0);
  });
}

module.exports = function(commander) {
  commander.command('exec <cmd>')
    .option("-I", "--interactive", "Run command with interactive", false)
    .description('Run an executable with the image-app')
    .action(action)
}
