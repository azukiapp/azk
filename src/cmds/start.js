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
        yield this._scale(system, parseInt(opts.to || 1));
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
    var columns = ['System'.blue, 'Status'.green, 'Instances'.yellow, 'Hostname'.green, 'Instances-Ports'.magenta];
    var table_status = this.table_add('table_status', { head: columns });

    return async(this, function* () {
      for (var system of systems) {
        var instances = yield system.instances();

        if (system.balanceable && instances.length > 0) {
          var hostname = system.url;
        } else {
          var hostname = system.hostname;
        }
        var ports   = yield this._ports_map(system, instances);
        var status  = instances.length > 0 ? 'UP'.green : 'DOWN'.red;
        var counter = system.scalable ? instances.length : '-';

        var line   = [system.name, status, counter, hostname, ports.join(', ')];
        this.table_push(table_status, line);
      }

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
          ports.push(`${instance.Annotations.azk.seq}-${name}:${port.port || "n/m".red}`);
        });
      }

      return _.isEmpty(ports) ? ["-"] : ports;
    });
  }

  reload(manifest, systems, opts) {
    throw new NotBeenImplementedError('reload');
  }
}

export function init(cli) {
  (new Cmd('start [system]', cli));
  (new Cmd('stop [system]', cli));
  (new Cmd('scale [system] [to]', cli));
  (new Cmd('status [system]', cli));

  (new Cmd('reload [system]', cli));
}
