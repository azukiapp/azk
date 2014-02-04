var cst  = require('../constants.js');
var url  = require('url');
var Q    = require('q');
var _    = require('underscore');
var qify = require('q-ify');
var util = require('util');

var Modem      = require('docker-modem');
var oDocker    = require('dockerode');
var oImage     = require('dockerode/lib/image');
var oContainer = require('dockerode/lib/container');

// TODO: Add support unix path
var opts   = url.parse(cst.DOCKER_HOST);

function list_methods(target) {
  return _.map(target.prototype, function(_, name) {
    return name;
  });
}

var Image = qify.factory(function(modem, name) {
  return new oImage(modem, name);
}, list_methods(oImage));

var Container = qify.factory(function(modem, id) {
  return new oContainer(modem, id);
}, list_methods(oContainer));

var AzkDocker = function(opts) {
  this.modem = new Modem(opts);
}

AzkDocker.prototype = _.clone(oDocker.prototype);

AzkDocker.prototype.getContainer = function(id) {
  return new Container(this.modem, id);
}

AzkDocker.prototype.getImage = function(name) {
  return new Image(this.modem, name);
}

function new_resize(container) {
  return function() {
    var dimensions = {
      h: process.stdout.rows,
      w: process.stderr.columns
    }

    if (dimensions.h != 0 && dimensions.w != 0) {
      container.resize(dimensions)
    }
  }
}

AzkDocker.prototype.run = function(image, cmd, opts) {
  var done = Q.defer();
  var self = this;
  var container = null;

  opts.stdout = opts.stdout || process.stdout;
  opts.stderr = opts.stderr || opts.stdout;

  var interactive = opts.stdin ? true : false;

  var optsc = {
    Image: image,
    Cmd: cmd,
    'AttachStdin': interactive,
    'AttachStdout': true,
    'AttachStderr': true,
    'Tty': interactive,
    'OpenStdin': interactive,
  }

  Q.async(function* (quem) {
    container = yield self.createContainer(optsc);
    done.notify("created");

    // Resize tty
    if (interactive) {
      var resize = new_resize(container);
      var isRaw  = process.isRaw;
    }

    // Attach container
    var stream = yield container.attach({
      log: true, stream: true,
      stdin: interactive, stdout: true, stderr: true
    });
    done.notify("attached");

    if (interactive) {
      stream.pipe(opts.stdout);
    } else {
      container.modem.demuxStream(stream,
        opts.stdout, opts.stderr);
    }

    // Connect stdin
    if (interactive) {
      opts.stdin.resume();
      opts.stdin.setRawMode(true)
      opts.stdin.pipe(stream);
    }

    // Start container
    yield container.start();
    done.notify("started");

    if (interactive) {
      resize();
      opts.stdout.on('resize', resize);
    }

    // Wait container
    done.notify("wait");
    yield container.wait();
    if (interactive) {
      opts.stdout.removeListener('resize', resize);
      opts.stdin.removeAllListeners();
      opts.stdin.setRawMode(isRaw);
      opts.stdin.resume();
      stream.end();
    }
  })()
  .then(function() {
    if (opts.rm) {
      return container.remove();
    }
  })
  .then(function() {
    done.resolve(container);
  })
  .fail(function(err) {
    done.reject(err)
  });

  return done.promise;
}

var blist   = [ "getContainer", "getImage", "run" ];
var methods = _.difference(list_methods(AzkDocker), blist);
var Docker  = qify.factory(function(opts) {
  return new AzkDocker(opts);
}, methods);

module.exports = new Docker({
  host: 'http://' + opts.hostname,
  port: opts.port,
});
