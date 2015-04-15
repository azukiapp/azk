import { _, async, config } from 'azk';
import { Tracker } from 'azk/utils/tracker';

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

  /**/console.log('\n>>---------\n arguments:\n', require('util').inspect(arguments,
  { showHidden: false, depth: null, colors: true }), '\n>>---------\n');/*-debug-*/

  var container   = null;
  var docker_opts = opts.docker || { start: {}, create: {} };

  opts.stdout = opts.stdout || process.stdout;
  opts.stderr = opts.stderr || opts.stdout;
  var daemon  = opts.daemon || false;
  var interactive = opts.stdin ? true : false;
  var nameservers = opts.dns || null;

  //// Force daemon mode
  if (daemon) {
    interactive = false;
    opts.tty    = false;
  }

  // Volumes
  var volumes = {}, v_binds = [];
  _.each(opts.volumes || {}, (target, point) => {
    volumes[point] = {};
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
    AZK_ENV: config('docker:namespace').split('.')[1],
  });
  opts.env = _.merge(envs, opts.env || {});

  var env  = _.reduce(opts.env, function(sum, value, key) {
    sum.push(key + "=" + value);
    return sum;
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
  };

  return async(docker, function* (notify) {
    var resize, isRaw, stream;
    container = yield this.createContainer(_.merge(optsc, docker_opts.create || {}));

    var c_notify = (type, ...data) => {
      return notify({ type, context: "container_run", id: container.id, data: data });
    };
    c_notify("created");
    notify({type: "created", id: container.id});

    // Resize tty
    if (interactive) {
      resize = new_resize(container);
      isRaw  = process.stdin.isRaw;
    }

    // Attach container
    if (!daemon) {
      stream = yield container.attach({
        log: true, stream: true,
        stdin: interactive, stdout: true, stderr: true
      });
      c_notify("attached");

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

        c_notify("stdin_pipe", { stdin: opts.stdin, stream });
      }
    }

    // Start container
    var start_opts = {
      Dns: nameservers,
      Binds: v_binds,
      PortBindings: p_binds,
    };

    yield container.start(_.merge(start_opts, docker_opts.start || {}));

    /**/console.log('\n>>---------\n opts.env:\n', require('util').inspect(opts.env,
    { showHidden: false, depth: null, colors: true }), '\n>>---------\n');/*-debug-*/

    //track FIXME
    yield _track({
      event_type: annotations.azk.type,
      action: daemon
    });

    c_notify("started");

    if (!daemon) {
      if (interactive && opts.tty) {
        resize();
        opts.stdout.on('resize', resize);
      }

      // Wait container
      c_notify("wait");
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

var _track = function (options = {}) {

  // action
  //  cmd.daemon == true

  return async(this, function* () {

    var shouldTrack = yield Tracker.checkTrackingPermission();
    if (!shouldTrack) {
      return;

    }

    var tracker = new Tracker();

    //  { // do docker
    //      >> event_type: 'run' || ‘shell’,
    //      action: ‘daemon’ || ‘shell’,
    //      >> state: 'ok' || 'error',
    //      >> reason: ‘......’,
    //      manifest_id: ’azk_12371892’
    //      images: {
    //        type: ‘docker’ || ‘dockerfile’,
    //        name: 'azukiapp/node:'
    //      },
    //    }

    // get event_type
    //  tracker.addData({
    //    event_type: event_type_name,
    //    manifest_id: this.system.manifest.namespace
    //  });

    // rescue session id
    tracker.meta_info = {
      agent_session_id: yield tracker.loadAgentSessionId(),
      command_id      : yield tracker.loadCommandId(),
    };

    tracker.addData(options);

    // track
    var tracker_result = yield tracker.track('container', tracker.data);
    if (tracker_result !== 0) {
      console.log('ERROR tracker_result:', tracker_result);
    }
  });

  // /**/console.log('\n>>---------\n [ASK ME] optsc:\n', require('util').inspect(optsc,
  //  { showHidden: false, depth: null, colors: true }), '\n>>---------\n');/*-debug-*/
};
