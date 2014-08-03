import { log, _, async, config, t } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Manifest } from 'azk/manifest';
import { SYSTEMS_CODE_ERROR, NotBeenImplementedError } from 'azk/utils/errors';

class Cmd extends Command {
  action(opts) {
    return async(this, function* () {
      yield Helpers.requireAgent();

      var manifest = new Manifest(this.cwd, true);
      var systems  = Helpers.getSystemsByName(manifest, opts.system);

      yield Cmd.status(this, manifest, systems);
    });
  }

  static status(cli, manifest, systems) {
    return async(cli, function* () {
      var columns = ['System'.blue, 'Status'.green, 'Instances'.yellow, 'Hostname'.green, 'Instances-Ports'.magenta];
      var table_status = this.table_add('table_status', { head: columns });

      for (var system of systems) {
        var instances = yield system.instances();

        if (system.balanceable && instances.length > 0) {
          var hostname = system.url;
        } else {
          var hostname = system.hostname;
        }
        var ports   = yield Cmd._ports_map(system, instances);
        var status  = instances.length > 0 ? 'UP'.green : 'DOWN'.red;
        var counter = system.scalable ? instances.length : '-';

        var line   = [system.name, status, counter, hostname, ports.join(', ')];
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
  (new Cmd('status [system]', cli));
}

