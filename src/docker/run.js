import { Q, _, config } from 'azk';
var path = require('path');

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

export function run(docker, Container, image, cmd, opts = { }) {
  var self = docker;
  var done = Q.defer();
  var container = null;

  opts.stdour = opts.stdout || process.stdout;
  opts.stderr = opts.stderr || opts.stdout;
  var daemon  = opts.daemon;
  var interactive = opts.stdin ? true : false;

  //// Force daemon mode
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

  // Container name and envs
  var name = opts.name || Container.generateName(opts.ns || "run");
  opts.env = opts.env  || {};
  opts.env['AZK_NAME'] = name;
  var env  = _.reduce(opts.env, function(sum, value, key) {
    sum.push(key + "=" + value)
    return sum
  }, []);

  // Create container options
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
    'name': name,
  }

  var block = Q.async(function* () {
    container = yield self.createContainer(optsc);
    done.notify({type: "created", id: container.id});

    // Resize tty
    if (interactive) {
      var resize = new_resize(container);
      var isRaw  = process.stdin.isRaw;
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
      var target = v_binds[i][0];
      if (config('agent:requires_vm')) {
        target = path.join(config('agent:vm:mount_point'), target);
      }
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

  // Returns
  block.then(() => done.resolve(container), done.reject);
  return done.promise;
}
