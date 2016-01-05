import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { _, lazy_require } from 'azk';
import { async } from 'azk/utils/promises';

var lazy = lazy_require({
  Manifest: ['azk/manifest'],
  moment  : 'moment',
});

class Status extends CliTrackerController {
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
        head: Status._head(opts, cli.ui.outputColumns()),
        text: opts.text
      });

      for (var system of systems) {
        var instances = yield system.instances({ type: "daemon" });
        var hostname;
        var ports_string;

        if (system.balanceable && instances.length > 0) {
          hostname = system.url.underline;
        } else {
          hostname = system.hostname;
        }
        var name;
        var status;
        if (instances.length > 0) {
          name   = `${system.name}`.green;
          status = `↑`.green;
        } else if (!system.auto_start) {
          name   = `${system.name}`.yellow;
          status = `−`.yellow;
        } else {
          name   = `${system.name}`.red;
          status = `↓`.red;
        }

        var ports   = Status._ports_map(system, instances);
        var counter = instances.length.toString().blue;

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
          line.push(system.image.name.white);
        }

        cli.ui.table_push(table, line);
      }

      cli.ui.table_show(table);
    });
  }

  static _ports_map(system, instances) {
    var instance, ports = [];

    instances = _.clone(instances);
    while ( (instance = instances.pop()) ) {
      _.each(instance.NetworkSettings.Access, (port) => {
        var name = system.portName(port.name);
        ports.push(
          `${instance.Annotations.azk.seq}-${name}:${port.port || "n/m".red}`
        );
      });
    }

    return _.isEmpty(ports) ? ["-"] : ports;
  }

  static _head(opts, columns_size = -1) {
    var columns = [
      "System".green,
      (columns_size > 80 ? 'Instances' : 'Inst.').blue,
      'Hostname/url'.yellow,
      'Instances-Ports'.magenta,
    ];

    if (!opts.short) {
      columns.push('Provisioned'.cyan);
    }
    if (opts.long) {
      columns.push('Image'.white);
    }
    if (!opts.text && !opts.short) {
      columns.unshift('');
    }

    return columns;
  }
}

module.exports = Status;
