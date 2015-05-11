import { _, lazy_require } from 'azk';
import { async, defer, all } from 'azk/utils/promises';
import { InteractiveCmds } from 'azk/cli/interactive_cmds';
import { Helpers } from 'azk/cli/command';

var lazy = lazy_require({
  Manifest: ['azk/manifest'],
  docker: ['azk/docker', 'default'],
});

class Cmd extends InteractiveCmds {
  action(opts) {
    return async(this, function* () {
      yield Helpers.requireAgent(this);

      var manifest = new lazy.Manifest(this.cwd, true);
      var systems  = manifest.getSystemsByName(opts.system);

      yield this.logs(manifest, systems, opts);
    });
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
      timestamps: opts.timestamps,
    };

    if (opts.follow) {
      options.follow = true;
    }

    var colors = ["green", "yellow", "blue", "red", "cyan", "grey"];
    var color  = -1;

    return all(_.map(systems, (system) => {
      return system.instances({ type: "daemon" }).then((instances) => {
        color++;

        if (opts.instances) {
          opts.instances = opts.instances.split(',');
          instances = _.filter(instances, (instance) => {
            return _.contains(opts.instances, instance.Annotations.azk.seq);
          });
        }

        return all(this.connect(system, colors[color % colors.length], instances, options));
      });
    }));
  }
}

export { Cmd };
export function init(cli) {
  (new Cmd('logs [system] [instances]', cli))
    .addOption(['--follow', '--tail', '-f'], { default: false })
    .addOption(['--lines', '-n'], { type: Number, default: "all" })
    .addOption(['--timestamps'], { default: true });
}
