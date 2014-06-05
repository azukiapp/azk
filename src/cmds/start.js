import { _, async, config, t } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Manifest } from 'azk/manifest';
import { SYSTEMS_CODE_ERROR } from 'azk/utils/errors';

class Cmd extends Command {
  action(opts) {
    return async(this, function* () {
      var manifest = new Manifest(this.cwd, true);
      var systems  = [manifest.systemDefault];

      if (opts.system) {
        var systems_name = opts.system.split(',');
        systems = _.reduce(systems_name, (systems, name) => {
          systems.push(manifest.system(name, true));
          return systems;
        }, []);
      }

      return this[`${this.name}`](manifest, systems, opts);
    });
  }

  _progress(event) {
    console.log(event);
  }

  _scale(system, instances) {
    return system.provision().then(() => {
      return system.scale(instances, this.stdout(), true);
    }).progress(this._progress);
  }

  start(manifest, systems) {
    return async(this, function* () {
      for (var system of systems) {
        var containers = yield system.instances();
        if (containers.length > 0) {
          this.fail('commands.start.already', system);
          return SYSTEMS_CODE_ERROR;
        }
        yield this._scale(system, 1);
      }
    });
  }

  scale(manifest, systems, opts) {
    return async(this, function* () {
      for (var system of systems) {
        yield this._scale(system, opts.instances);
      }
    });
  }

  status(manifest, systems, opts) {
    return async(this, function* () {
      this.output("Systems status: ")
      for (var system of systems) {
        var instances = yield system.instances(opts.all);
        this.tOutput("commands.status.status", {
          system: system.name,
          instances: instances.length
        });
      }
    });
  }
}

export function init(cli) {
  (new Cmd('start', cli))
    .addOption(['--system', '-s'], { type: String });

  // TODO: Add kill
  (new Cmd('stop', cli))
    .addOption(['--system', '-s'], { type: String });

  (new Cmd('scale', cli))
    .addOption(['--system', '-s'], { type: String })
    .addOption(['--instances', '-n'], { type: Number, default: 1 });

  (new Cmd('status', cli))
    .addOption(['--system', '-s'], { type: String })
    .addOption(['--all', '-a'], { default: false })
}
