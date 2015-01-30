import { _, async, lazy_require } from 'azk';
import { InteractiveCmds } from 'azk/cli/interactive_cmds';
import { Helpers } from 'azk/cli/command';

/* global Manifest, moment */
lazy_require(this, {
  Manifest: ['azk/manifest'],
  moment: 'moment',
});

class Cmd extends InteractiveCmds {
  action(opts) {
    return async(this, function* () {
      yield Helpers.requireAgent(this);

      var manifest = new Manifest(this.cwd, true);
      Helpers.manifestValidate(this, manifest);
      var systems  = manifest.getSystemsByName(opts.system);

      yield Cmd.status(this, manifest, systems, opts);
    });
  }

  static status(cli, manifest, systems, opts = {}) {
    return async(cli, function* () {
      // Force types if not interactive or narrow console
      if (cli.outputColumns() === -1) {
        opts.text = true;
      }
      if (!opts.long && cli.outputColumns() < 90) {
        opts.short = true;
      }

      var table = cli.table_add('status', {
        head: Cmd._head(opts, cli.outputColumns()),
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
        var ports   = Cmd._ports_map(system, instances);
        var name    = instances.length > 0 ? `${system.name}`.green : `${system.name}`.red;
        var status  = instances.length > 0 ? `↑`.green : `↓`.red;
        var counter = instances.length.toString().blue;

        // Provisioned
        var provisioned = system.provisioned;
        provisioned = provisioned ? moment(provisioned).fromNow() : "-";

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

        cli.table_push(table, line);
      }

      cli.table_show(table);
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

export { Cmd };
export function init(cli) {
  (new Cmd('status [system]', cli))
    .addOption(['--text', '-t'], { default: false })
    .addOption(['--long', '-l'], { default: false })
    .addOption(['--short'], { default: false });
}
