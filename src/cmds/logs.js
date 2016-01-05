import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { _, lazy_require } from 'azk';
import { defer, thenAll } from 'azk/utils/promises';

var lazy = lazy_require({
  Manifest: ['azk/manifest'],
  docker  : ['azk/docker', 'default'],
});

class Logs extends CliTrackerController {
  index(opts) {
    return Helpers.requireAgent(this.ui)
      .then(() => {
        var manifest = new lazy.Manifest(this.cwd, true);
        var systems  = manifest.getSystemsByName(opts.system);
        return this.logs(manifest, systems, opts);
      })
      .then(() => 0);
  }

  make_out(output, name) {
    return {
      write(buffer) {
        var data = buffer.toString().match(/^\[(.*?)\](.*\n)$/m);
        if (data) {
          output.write(`${data[1].magenta} ${name}:${data[2]}`);
        } else {
          output.write(`${name} `);
          output.write(buffer);
        }
      }
    };
  }

  connect(system, color, instances, options) {
    return _.map(instances, (instance) => {
      var name = `${system.name}${instance.Annotations.azk.seq}`[color];
      var container = lazy.docker.getContainer(instance.Id);
      var stdout = this.make_out(process.stdout, name);
      var stderr = this.make_out(process.stderr, name);

      return container.logs(options).then((stream) => {
        return defer((resolve) => {
          container.modem.demuxStream(stream, stdout, stderr);
          stream.on('end', resolve);
        });
      });
    });
  }

  logs(manifest, systems, opts = {}) {
    var options = {
      stdout: true,
      stderr: true,
      tail: opts.lines,
      timestamps: !opts['no-timestamps'],
    };

    if (opts.follow) {
      options.follow = true;
    }

    var colors = ["green", "yellow", "blue", "red", "cyan", "grey"];
    var color  = -1;

    return thenAll(_.map(systems, (system) => {
      return system.instances({ type: "daemon" }).then((instances) => {
        color++;

        if (opts.instances) {
          opts.instances = opts.instances.split(',');
          instances = _.filter(instances, (instance) => {
            return _.contains(opts.instances, instance.Annotations.azk.seq);
          });
        }

        return thenAll(this.connect(system, colors[color % colors.length], instances, options));
      });
    }));
  }
}

module.exports = Logs;
