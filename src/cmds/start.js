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

      yield this[`${this.name}`](manifest, systems, opts);

      if (_.contains(["start", "stop", "scale"], this.name)) {
        this.output("");
        yield this.status(manifest, systems);
      }
    });
  }

  _scale(system, instances = {}) {
    var progress = (event) => {
      var pull_progress = Helpers.newPullProgress(this);
      if (event.type == "pull_msg") {
        pull_progress(event);
      } else {
        var keys = ["commands", "scale"];
        switch(event.type) {
          case "action":
            var data = { image: system.image.name };
            this.tOutput([...keys, event.action], data);
            break;
          case "scale":
            //keys.push((event.from > event.to) ? "starting" : "stopping");
            this.tOutput([...keys, "scale"], event);
            //console.log([...keys, "scale"], event);
            break;
          case "provision":
            this.tOutput([...keys, "provision"], event);
            break;
          default:
            log.debug(event);
        }
      }
    }

    return system.scale(instances).progress(progress);
  }

  start(manifest, systems) {
    return async(this, function* () {
      for (var i = 0; i < systems.length; i++) {
        var system = systems[i];
        var icc = yield this._scale(system);
        if (icc == 0) {
          this.fail('commands.start.already', system);
          return SYSTEMS_CODE_ERROR;
        }
        return 0;
      }
    });
  }

  scale(manifest, systems, opts) {
    return async(this, function* () {
      for (var i = 0; i < systems.length; i++) {
        var system = systems[i];
        yield this._scale(system, opts.instances);
      }
    })
  }

  stop(manifest, systems, opts) {
    return async(this, function* () {
      for (var i = 0; i < systems.length; i++) {
        var system = systems[i];
        var icc    = yield this._scale(system, 0);
        if (icc == 0) {
          this.fail('commands.stop.not_running', system);
          return SYSTEMS_CODE_ERROR;
        }
        return 0;
      }
    });
  }

  status(manifest, systems, opts = {}) {
    var columns = ['System'.blue, 'Instances'.yellow, 'Hostname'.green, 'Ports'.magenta];
    var table_status = this.table_add('table_status', { head: columns });

    // Instances columns
    columns = ['Up Time'.green, 'Command'.cyan];
    if (opts.all) {
      columns.unshift('Status'.red);
      columns.unshift('Type'.magenta);
    };
    columns.unshift('Azk id'.blue);

    return async(this, function* () {
      for (var system of systems) {
        var instances = yield system.instances({ include_dead: opts.all });

        if (opts.instances) {
          instances = _.sortBy(instances, function(container) {
            return container.Created * -1;
          });

          var rows = _.map(instances, function(container) {
            var names = container.Names[0].split('.');
            var row   = [ container.Status, container.Command ];

            if (opts.all) {
              // Status
              if (container.State.Running) {
                var status = container.State.Paused ? 'paused'.blue : 'runnig'.green;
              } else {
                var status =  container.State.ExitCode > 0 ? "dead".red : "ended".cyan;
              }

              // Type
              var type = container.Annotations.azk.type;
              if (type == "shell") {
                type = `${type}: ${container.Annotations.azk.shell.white}`;
              }

              // Add rows
              row.unshift(status);
              row.unshift(type.magenta);
            }

            row.unshift(container.Id.slice(0, 12));

            return row;
          });

          this.output(system.name + ": " + instances.length + " instances");
          var table_name = 'table_' + system.name;
          this.table_add(table_name, { head: columns });
          this.table_push(table_name, ...rows);
          this.table_show(table_name);
        } else {
          if (system.balanceable && instances.length > 0) {
            var hostname = system.url;
          } else {
            var hostname = system.hostname;
          }
          var ports = yield this._ports_map(system, instances);
          var line  = [system.name, instances.length, hostname, ports.join(', ')];
          this.table_push(table_status, line);
        }
      }

      if (!opts.instances)
        this.table_show(table_status);
    });
  }

  _ports_map(system, instances) {
    return async(this, function* () {
      var instance, ports = [];

      instances = _.clone(instances);
      while(instance = instances.pop()) {
        _.each(instance.NetworkSettings.Access, (port) => {
          var name = system.portName(port.name);
          ports.push(`${name}:${port.port || "n/m".red}`);
        });
      }

      return _.isEmpty(ports) ? ["-"] : ports;
    });
  }

  reload(manifest, systems, opts) {
    throw new NotBeenImplementedError('reload');
  }

  up(manifest, systems, opts) {
    throw new NotBeenImplementedError('up');
  }
}

export function init(cli) {
  (new Cmd('start [system]', cli));

  // TODO: Add kill
  (new Cmd('stop [system]', cli));

  (new Cmd('scale [system]', cli))
    .addOption(['--instances', '-i'], { type: Number, default: 1 });

  (new Cmd('status [system]', cli))
    .addOption(['--instances', '-i'], { default: false })
    .addOption(['--all', '-a'], { default: false });

  (new Cmd('reload [system]', cli));
}
