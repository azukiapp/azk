import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { _, lazy_require } from 'azk';
import { async } from 'azk/utils/promises';

var lazy = lazy_require({
  Manifest: ['azk/manifest'],
  moment  : 'moment',
});

export default class Status extends CliTrackerController {
  index(opts) {
    return Helpers.requireAgent(this.ui)
      .then(() => {
        var manifest = new lazy.Manifest(this.cwd, true);
        Helpers.manifestValidate(this.ui, manifest);
        var systems  = manifest.getSystemsByName(opts.system);
        return Status.status(this, manifest, systems, opts);
      })
      .then(() => 0);
  }

  static status(cli, manifest, systems, opts = {}) {
    return async(cli, function* () {
      // Force types if not interactive or narrow console
      if (cli.ui.outputColumns() === -1) {
        opts.text = true;
      }
      if (!opts.long && cli.ui.outputColumns() < 90) {
        opts.short = true;
      }

      var table = cli.ui.table_add('status', {
        head: Status._head(opts, cli.ui.outputColumns(), cli.ui.c),
        text: opts.text
      });

      for (var system of systems) {
        var instances = yield system.instances({ type: "daemon" });
        var hostname;
        var ports_string;

        if (system.balanceable && instances.length > 0) {
          hostname = cli.ui.c.underline(system.url);
        } else {
          hostname = system.hostname;
        }
        var name;
        var status;
        if (instances.length > 0) {
          name   = cli.ui.c.green(`${system.name}`);
          status = cli.ui.c.green(`↑`);
        } else if (!system.auto_start) {
          name   = cli.ui.c.yellow(`${system.name}`);
          status = cli.ui.c.yellow(`−`);
        } else {
          name   = cli.ui.c.red(`${system.name}`);
          status = cli.ui.c.red(`↓`);
        }

        var ports   = Status._ports_map(system, instances, cli.ui.c);
        var counter = cli.ui.c.blue(instances.length.toString());

        // Provisioned
        var provisioned = system.provisioned;
        provisioned = provisioned ? lazy.moment(provisioned).fromNow() : "-";

        if (opts.text) {
          ports_string = ports.join(', ');
        } else {
          var ports_line = [];

          for (var i = 0; i <= ports.length; i += 2) {
            var _ports = ports.slice(i, i + 2).join(', ');
            ports_line.push(_ports);
          }

          ports_string = ports_line.join('\n');
        }

        // Mount line values
        var line = [status, name, counter, hostname, ports_string];
        if (opts.text || opts.short) {
          line.shift();
        }
        if (!opts.short) {
          line.push(provisioned);
        }
        if (opts.long) {
          line.push(cli.ui.c.white(system.image.name));
        }

        cli.ui.table_push(table, line);
      }

      cli.ui.table_show(table);
    });
  }

  static _ports_map(system, instances, color) {
    var instance, ports = [];

    instances = _.clone(instances);
    while ( (instance = instances.pop()) ) {
      _.each(instance.NetworkSettings.Access, (port) => {
        var name = system.portName(port.name);
        ports.push(
          `${instance.Annotations.azk.seq}-${name}:${port.port || color.red("n/m")}`
        );
      });
    }

    return _.isEmpty(ports) ? ["-"] : ports;
  }

  static _head(opts, columns_size = -1, color) {
    var columns = [
      color.green("System"),
      color.blue(columns_size > 80 ? 'Instances' : 'Inst.'),
      color.yellow('Hostname/url'),
      color.magenta('Instances-Ports'),
    ];

    if (!opts.short) {
      columns.push(color.cyan('Provisioned'));
    }
    if (opts.long) {
      columns.push(color.white('Image'));
    }
    if (!opts.text && !opts.short) {
      columns.unshift('');
    }

    return columns;
  }
}
