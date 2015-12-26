import { _, config, log } from 'azk';
import { publish } from 'azk/utils/postal';
import { async } from 'azk/utils/promises';
import { default as tracker } from 'azk/utils/tracker';

function new_resize(container) {
  return function() {
    var dimensions = {
      h: process.stdout.rows,
      w: process.stderr.columns
    };

    if (dimensions.h !== 0 && dimensions.w !== 0) {
      container.resize(dimensions);
    }
  };
}

export function run(docker, Container, image, cmd, opts = { }) {
  var container = null;

  opts.stdout = opts.stdout  || process.stdout;
  opts.stderr = opts.stderr  || opts.stdout;
  var verbose = opts.verbose || false;
  var daemon  = opts.daemon || false;
  var interactive = opts.stdin ? true : false;
  var nameservers = opts.dns || null;

  //// Force daemon mode
  if (daemon) {
    interactive = false;
    opts.tty    = false;
  }

  // Volumes
  var v_binds = [];
  _.each(opts.volumes || {}, (target, point) => {
    v_binds.push( `${target}:${point}` );
  });

  // Ports
  var ports = {}, p_binds = {};
  _.each(opts.ports || [], function(bind, port) {
    ports[port] = {};
    p_binds[port] = bind;
  });

  // Annotations
  var annotations = opts.annotations || { azk : {} };
  annotations.azk.type = annotations.azk.type || "run";

  // Container name and envs
  var name = opts.name || Container.serializeAnnotations(annotations);
  var envs = _.merge(Container.envsFromAnnotations(annotations), {
    AZK_NAME: name,
    AZK_ENV : config('docker:namespace').split('.')[1],
  });
  opts.env = _.merge(envs, opts.env || {});

  var env  = _.reduce(opts.env, function(sum, value, key) {
    sum.push(key + "=" + value);
    return sum;
  }, []);

  // Create container options
  var optsc = {
    'Image': image,
    'Cmd': cmd,
    'AttachStdin': interactive,
    'AttachStdout': opts.stdout ? true : false,
    'AttachStderr': opts.stderr ? true : false,
    'Tty': opts.tty,
    'OpenStdin': interactive,
    'ExposedPorts': ports,
    'Env': env,
    'WorkingDir': opts.working_dir || "/",
    'name': name,
    'HostConfig': {
      'Binds': v_binds,
      'PortBindings': p_binds,
      'Dns': nameservers,
    }
  };

  return async(docker, function* () {
    var resize, isRaw, stream;
    var create_opts = _.merge(optsc, opts.extra || {});
    log.debug("[docker] creating a container with ", create_opts);
    container = yield this.createContainer(create_opts);

    var c_publish = (type, ...data) => {
      publish("docker.run.status", { type, context: "container_run", id: container.id, data: data });
    };
    c_publish("created");
    publish("docker.run.status", {type: "created", id: container.id});

    // Resize tty
    if (interactive) {
      resize = new_resize(container);
      isRaw  = process.stdin.isRaw;
    }

    // Attach container
    if ((!daemon) || verbose) {
      stream = yield container.attach({
        log: true, stream: true,
        stdin: interactive, stdout: true, stderr: true
      });
      c_publish("attached");

      if (interactive) {
        stream.pipe(opts.stdout);
      } else {
        container.modem.demuxStream(stream, opts.stdout, opts.stderr);
      }

      // Connect stdin
      if (interactive) {
        opts.stdin.resume();
        if (opts.tty) {
          try {
            opts.stdin.setRawMode(true);
          } catch (err) {}
        }

        if (opts.stdin.custom_pipe) {
          opts.stdin.custom_pipe(stream);
        } else {
          opts.stdin.pipe(stream);
        }

        c_publish("stdin_pipe", { stdin: opts.stdin, stream });
      }
    }

    // Start container
    var start_opts = {};

    log.debug("[docker] attaching a container with ", start_opts);
    yield container.start(start_opts);

    //track
    try {
      var imageObj = (image.indexOf('azkbuild') === -1) ? {type: 'docker', name: image} : {type: 'dockerfile'};
      yield tracker.sendEvent("container", {
        event_type: 'run',
        container_type: annotations.azk.type,
        manifest_id: annotations.azk.mid,
        image: imageObj
      });
    } catch (err) {
      tracker.logAnalyticsError(err);
    }

    c_publish("started");

    if (!daemon) {
      if (interactive && opts.tty) {
        resize();
        opts.stdout.on('resize', resize);
      }

      // Wait container
      c_publish("wait");
      yield container.wait();
      if (interactive) {
        opts.stdout.removeListener('resize', resize);
        opts.stdin.removeAllListeners();
        if (opts.tty) {
          try {
            opts.stdin.setRawMode(isRaw);
          } catch (err) {}
        }
        opts.stdin.resume();
        stream.end();
      }
    }

    return container;
  });
}
