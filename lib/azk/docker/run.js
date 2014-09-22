"use strict";
var __moduleName = "src/docker/run";
var $__1 = require('azk'),
    _ = $__1._,
    async = $__1.async,
    config = $__1.config,
    utils = $__1.utils;
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
  var docker_opts = opts.docker || {
    start: {},
    create: {}
  };
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
  _.each(opts.volumes || {}, (function(target, point) {
    volumes[point] = {};
    v_binds.push((target + ":" + point));
  }));
  var ports = {},
      p_binds = {};
  _.each(opts.ports || [], function(bind, port) {
    ports[port] = {};
    p_binds[port] = bind;
  });
  var annotations = opts.annotations || {azk: {}};
  annotations.azk.type = annotations.azk.type || "run";
  var name = opts.name || Container.serializeAnnotations(annotations);
  var envs = _.merge(Container.envsFromAnnotations(annotations), {
    AZK_NAME: name,
    AZK_ENV: config('docker:namespace').split('.')[1]
  });
  opts.env = _.merge(envs, opts.env || {});
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
    var c_notify,
        resize,
        isRaw,
        stream,
        start_opts;
    return $traceurRuntime.generatorWrap(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.state = 2;
            return this.createContainer(_.merge(optsc, docker_opts.create || {}));
          case 2:
            container = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            c_notify = (function(type) {
              for (var data = [],
                  $__0 = 1; $__0 < arguments.length; $__0++)
                data[$__0 - 1] = arguments[$__0];
              return notify({
                type: type,
                context: "container_run",
                id: container.id,
                data: data
              });
            });
            c_notify("created");
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
            c_notify("attached");
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
              if (opts.stdin.custom_pipe) {
                opts.stdin.custom_pipe(stream);
              } else {
                opts.stdin.pipe(stream);
              }
              c_notify("stdin_pipe", {
                stdin: opts.stdin,
                stream: stream
              });
            }
            $ctx.state = 10;
            break;
          case 10:
            start_opts = {
              Dns: nameservers,
              Binds: v_binds,
              PortBindings: p_binds
            };
            $ctx.state = 30;
            break;
          case 30:
            $ctx.state = 13;
            return container.start(_.merge(start_opts, docker_opts.start || {}));
          case 13:
            $ctx.maybeThrow();
            $ctx.state = 15;
            break;
          case 15:
            c_notify("started");
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
            c_notify("wait");
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