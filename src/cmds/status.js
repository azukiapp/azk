import { log, _, async, config, t, lazy_require } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { SYSTEMS_CODE_ERROR, NotBeenImplementedError } from 'azk/utils/errors';

lazy_require(this, {
  Manifest: ['azk/manifest'],
  moment: 'moment',
});

class Cmd extends Command {
  action(opts) {
    return async(this, function* () {
      yield Helpers.requireAgent();

      var manifest = new Manifest(this.cwd, true);
      Helpers.manifestValidate(this, manifest);
      var systems  = manifest.getSystemsByName(opts.system);

      yield Cmd.status(this, manifest, systems, opts);
    });
  }

  static status(cli, manifest, systems, opts = {}) {
    return async(cli, function* () {
      var columns = ['', 'System'.blue, 'Instancies'.green, 'Hostname'.yellow, 'Instances-Ports'.magenta, "Provisioned".cyan];

      if (opts.long) {
        columns.push('Image'.white);
      }

      var table_status = this.table_add('table_status', { head: columns });

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

        var line = [status, name, counter, hostname, ports.join(', '), provisioned];
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
    .addOption(['--long', '-l'], { default: false });
}

