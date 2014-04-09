var uuid = require('node-uuid');

import { Q, pp, config, unders as _ } from 'azk';
import Utils from 'azk/utils';

export class Image extends Utils.qify('dockerode/lib/image') {}

export class Container extends Utils.qify('dockerode/lib/container') {
  static generateName(ns) {
    return `${config('docker:namespace')}.${ns}.${uuid.v1().replace(/-/g, "")}`;
  }
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

export class Docker extends Utils.qify('dockerode') {
  constructor(opts) {
    console.log("Connect %s:%s", opts.host, opts.port);
    super(opts);
  }

  getImage(name) {
    return new Image(this.modem, name);
  }

  getContainer(id) {
    return new Container(this.modem, id);
  }

  findImage(name) {
    return this.getImage(name).inspect()
      .then(
        (_data) => { return this.getImage(name); },
        (err  ) => {
          if (err.statusCode == 404)
            return null;
          throw err;
        }
      );
  }

  run(image, cmd, opts = { }) {
    var self = this;
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
        v_binds[i] = v_binds[i][0] + ':' + v_binds[i][1];
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
}
