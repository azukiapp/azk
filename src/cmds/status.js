import { log, _, async, config, t, lazy_require } from 'azk';
import { InteractiveCmds } from 'azk/cli/interactive_cmds';
import { Command, Helpers } from 'azk/cli/command';
import { SYSTEMS_CODE_ERROR, NotBeenImplementedError } from 'azk/utils/errors';

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
      var columns = ['', 'System'.blue, 'Instances'.green, 'Hostname'.yellow, 'Instances-Ports'.magenta, "Provisioned".cyan];

      if (opts.long) {
        columns.push('Image'.white);
      }

      var table_options = {
        head: columns,
        text: opts.text
      }

      var table_status = this.table_add('table_status', table_options);

      for (var system of systems) {
        var instances = yield system.instances({ type: "daemon" });

        if (system.balanceable && instances.length > 0) {
          var hostname = system.url.underline;
        } else {
          var hostname = system.hostname;
        }
        var ports   = yield Cmd._ports_map(system, instances);
        var name    = instances.length > 0 ? `${system.name}`.green : `${system.name}`.red;
        var status  = instances.length > 0 ? `↑`.green : `↓`.red;
        var counter = instances.length.toString().blue;

        // Provisioned
        var provisioned = system.provisioned;
        provisioned = provisioned ? moment(provisioned).fromNow() : "-";

        if (opts.text) {
          var ports_string = ports.join(', ')
        } else {
          var ports_line = [];

          for (var i = 0; i <= ports.length; i+=2) {
            var _ports = ports.slice(i, i+2).join(', ');
            ports_line.push(_ports);
          };

          var ports_string = ports_line.join('\n')
        }

        var line = [status, name, counter, hostname, ports_string, provisioned];

        if (opts.long) {
          line.push(system.image.name.white);
        }

        this.table_push(table_status, line);
      }

      this.table_show(table_status);
    });
  }

  static _ports_map(system, instances) {
    return async(function* () {
      var instance, ports = [];

      instances = _.clone(instances);
      while(instance = instances.pop()) {
        _.each(instance.NetworkSettings.Access, (port) => {
          var name = system.portName(port.name);
          ports.push(
            `${instance.Annotations.azk.seq}-${name}:${port.port || "n/m".red}`
          );
        });
      }

      return _.isEmpty(ports) ? ["-"] : ports;
    });
  }
}

export { Cmd };
export function init(cli) {
  (new Cmd('status [system]', cli))
    .addOption(['--text', '-t'], { default: false })
    .addOption(['--long', '-l'], { default: false });
}

