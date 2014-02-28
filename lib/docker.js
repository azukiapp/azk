var cst   = require('../constants.js');
var url   = require('url');
var Q     = require('q');
var _     = require('underscore');
var qify  = require('q-ify');
var util  = require('util');
var Agent = require('./agent');
var uuid  = require('node-uuid');
var azk   = require('./azk');

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

AzkDocker.prototype.findImage = function(name) {
  var self = this;
  return self.getImage(name).inspect()
    .then(function(data) {
      return self.getImage(name);
    }, function(err) {
      if (err.statusCode == 404)
        return null;
      throw err;
    });
}

function generate_name(ns) {
  return azk.cst.DOCKER_NS_NAME + "." + ns + "." + uuid.v1().replace(/-/g, "");
}

AzkDocker.prototype.run = function(image, cmd, opts) {
  var done = Q.defer();
  var self = this;
  var container = null;

  opts.stderr = opts.stderr || opts.stdout;

  var daemon = opts.daemon;
  var interactive = opts.stdin ? true : false;

  // Force daemon mode
  if (daemon) {
    interactive = false;
    opts.tty    = false;
    opts.rm     = false;
  }

  // Volumes
  var volumes = {}, v_binds = [];
  _.each(opts.volumes || [], function(point, target) {
    volumes[point] = {};
    v_binds.push([target, point]);
  });

  // Ports
  var ports = {}, p_binds = {};
  _.each(opts.ports || [], function(bind, port) {
    ports[port] = {};
    p_binds[port] = bind;
  });

  var optsc = {
    Image: image,
    Cmd: cmd,
    'AttachStdin': interactive,
    'AttachStdout': opts.stdout ? true : false,
    'AttachStderr': opts.stderr ? true : false,
    'Tty': opts.tty,
    'OpenStdin': interactive,
    'Volumes': volumes,
    'ExposedPorts': ports,
    'WorkingDir': opts.working_dir || "/",
    'name': opts.name || generate_name(opts.ns || "run"),
  }

  Q.async(function* () {
    container = yield self.createContainer(optsc);
    done.notify({type: "created", id: container.id});

    // Resize tty
    if (interactive) {
      var resize = new_resize(container);
      var isRaw  = process.isRaw;
    }

    // Attach container
    if (!daemon) {
      var stream = yield container.attach({
        log: true, stream: true,
        stdin: interactive, stdout: true, stderr: true
      });
      done.notify({type: "attached", id: container.id});

      if (interactive) {
        stream.pipe(opts.stdout);
      } else {
        container.modem.demuxStream(stream,
          opts.stdout, opts.stderr);
      }

      // Connect stdin
      if (interactive) {
        opts.stdin.resume();
        if (opts.tty) {
          try {
            opts.stdin.setRawMode(true)
          } catch(err) {};
        }
        opts.stdin.pipe(stream);
      }
    }

    // Start container
    for(var i = 0; i < v_binds.length; i++) {
      var target = yield Agent.executeRemote('resolve', v_binds[i][0])
      v_binds[i] = target + ':' + v_binds[i][1];
    }

    yield container.start({ "Binds": v_binds, PortBindings: p_binds });
    done.notify({type: "started", id: container.id});

    if (!daemon) {
      if (interactive && opts.tty) {
        resize();
        opts.stdout.on('resize', resize);
      }

      // Wait container
      done.notify({type: "wait", id: container.id});
      yield container.wait();
      if (interactive) {
        opts.stdout.removeListener('resize', resize);
        opts.stdin.removeAllListeners();
        if (opts.tty)
          try {
            opts.stdin.setRawMode(isRaw);
          } catch(err) {};
        opts.stdin.resume();
        stream.end();
      }
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

var blist   = [ "getContainer", "getImage", "findImage", "run" ];
var methods = _.difference(list_methods(AzkDocker), blist);
var Docker  = qify.factory(function(opts) {
  return new AzkDocker(opts);
}, methods);

module.exports = new Docker({
  host: 'http://' + opts.hostname,
  port: opts.port,
});
