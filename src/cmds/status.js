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
      yield Helpers.requireAgent(this);

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

        var lines   = [];
        var splits  = Math.round(ports.length / 2)


        for (var i = 0; i <= ports.length; i+=2) {
          var line;
          var _ports = ports.slice(i, i+2).join(', ');

          if (i == 0) {
            line = [status, name, counter, hostname, _ports, provisioned];
          } else {
            line = ['', '', '', '', _ports, ''];
          }

          if (opts.long) {
            line.push(system.image.name.white);
          }

          lines.push(line)
        };


        _.map(lines, (line, ix) => {
          if (lines.length > 1 && ix > 0) {
            this.table(table_status).options.wrappedLines.push(this.table(table_status).length)
          };
          this.table_push(table_status, line);
        });
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

