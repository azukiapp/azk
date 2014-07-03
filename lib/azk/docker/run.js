"use strict";
var __moduleName = "src/docker/run";
var $__0 = require('azk'),
    _ = $__0._,
    async = $__0.async,
    config = $__0.config;
var path = require('path');
function new_resize(container) {
  return function() {
    var dimensions = {
      h: process.stdout.rows,
      w: process.stderr.columns
    };
    if (dimensions.h != 0 && dimensions.w != 0) {
      container.resize(dimensions);
    }
  };
}
function run(docker, Container, image, cmd) {
  var opts = arguments[4] !== (void 0) ? arguments[4] : {};
  var container = null;
  opts.stdout = opts.stdout || process.stdout;
  opts.stderr = opts.stderr || opts.stdout;
  var daemon = opts.daemon || false;
  var interactive = opts.stdin ? true : false;
  var nameservers = opts.dns || null;
  if (daemon) {
    interactive = false;
    opts.tty = false;
    opts.rm = false;
  }
  var volumes = {},
      v_binds = [];
  _.each(opts.volumes || {}, (function(point, target) {
    volumes[point] = {};
    v_binds.push([target, point, 'remote']);
  }));
  _.each(opts.local_volumes || {}, (function(point, target) {
    volumes[point] = {};
    v_binds.push([target, point, 'local']);
  }));
  var ports = {},
      p_binds = {};
  _.each(opts.ports || [], function(bind, port) {
    ports[port] = {};
    p_binds[port] = bind;
  });
  var Annotations = opts.annotations || {azk: {}};
  Annotations.azk.type = Annotations.azk.type || "run";
  var name = opts.name || Container.serializeAnnotations(Annotations);
  opts.env = opts.env || {};
  opts.env['AZK_NAME'] = name;
  var env = _.reduce(opts.env, function(sum, value, key) {
    sum.push(key + "=" + value);
    return sum;
  }, []);
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
    'Env': env,
    'WorkingDir': opts.working_dir || "/",
    'name': name
  };
  return async(docker, function(notify) {
    var resize,
        isRaw,
        stream,
        i,
        target;
    return $traceurRuntime.generatorWrap(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.state = 2;
            return this.createContainer(optsc);
          case 2:
            container = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            notify({
              type: "created",
              id: container.id
            });
            if (interactive) {
              resize = new_resize(container);
              isRaw = process.stdin.isRaw;
            }
            $ctx.state = 28;
            break;
          case 28:
            $ctx.state = (!daemon) ? 5 : 10;
            break;
          case 5:
            $ctx.state = 6;
            return container.attach({
              log: true,
              stream: true,
              stdin: interactive,
              stdout: true,
              stderr: true
            });
          case 6:
            stream = $ctx.sent;
            $ctx.state = 8;
            break;
          case 8:
            notify({
              type: "attached",
              id: container.id
            });
            if (interactive) {
              stream.pipe(opts.stdout);
            } else {
              container.modem.demuxStream(stream, opts.stdout, opts.stderr);
            }
            if (interactive) {
              opts.stdin.resume();
              if (opts.tty) {
                try {
                  opts.stdin.setRawMode(true);
                } catch (err) {}
                ;
              }
              opts.stdin.pipe(stream);
            }
            $ctx.state = 10;
            break;
          case 10:
            for (i = 0; i < v_binds.length; i++) {
              target = v_binds[i][0];
              if (v_binds[i][2] == "remote") {
                target = docker.resolvePath(target);
              }
              v_binds[i] = target + ':' + v_binds[i][1];
            }
            $ctx.state = 30;
            break;
          case 30:
            $ctx.state = 13;
            return container.start({
              "Binds": v_binds,
              PortBindings: p_binds,
              Dns: nameservers
            });
          case 13:
            $ctx.maybeThrow();
            $ctx.state = 15;
            break;
          case 15:
            notify({
              type: "started",
              id: container.id
            });
            $ctx.state = 32;
            break;
          case 32:
            $ctx.state = (!daemon) ? 20 : 23;
            break;
          case 20:
            if (interactive && opts.tty) {
              resize();
              opts.stdout.on('resize', resize);
            }
            notify({
              type: "wait",
              id: container.id
            });
            $ctx.state = 21;
            break;
          case 21:
            $ctx.state = 17;
            return container.wait();
          case 17:
            $ctx.maybeThrow();
            $ctx.state = 19;
            break;
          case 19:
            if (interactive) {
              opts.stdout.removeListener('resize', resize);
              opts.stdin.removeAllListeners();
              if (opts.tty)
                try {
                  opts.stdin.setRawMode(isRaw);
                } catch (err) {}
              ;
              opts.stdin.resume();
              stream.end();
            }
            $ctx.state = 23;
            break;
          case 23:
            $ctx.returnValue = container;
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, this);
  });
}
module.exports = {
  get run() {
    return run;
  },
  __esModule: true
};
//# sourceMappingURL=run.js.map