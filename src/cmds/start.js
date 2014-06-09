import { _, async, config, t } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { Manifest } from 'azk/manifest';
import { SYSTEMS_CODE_ERROR, NotBeenImplementedError } from 'azk/utils/errors';

class Cmd extends Command {
  action(opts) {
    return async(this, function* () {
      yield Helpers.requireAgent();

      var manifest = new Manifest(this.cwd, true);
      var systems  = [manifest.systemDefault];

      if (opts.system) {
        if (opts.system == ":all") {
          systems = _.map(manifest.systems, (system) => {
            return system;
          });
        } else {
          var systems_name = opts.system.split(',');
          systems = _.reduce(systems_name, (systems, name) => {
            systems.push(manifest.system(name, true));
            return systems;
          }, []);
        }
      }

      return this[`${this.name}`](manifest, systems, opts);
    });
  }

  _scale(system, instances) {
    var progress = (event) => {
      var pull_progress = Helpers.newPullProgress(this);
      if (event.type == "pull_msg") {
        pull_progress(event);
      } else {
        console.log(event);
      }
    }
    return system.provision().then(() => {
      return system.scale(instances, this.stdout(), true);
    }).progress(progress);
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

  stop(manifest, systems, opts) {
    return async(this, function* () {
      for (var system of systems) {
        var containers = yield system.instances();
        if (containers.length <= 0) {
          this.fail('commands.start.not_running', system);
        } else {
          yield this._scale(system, 0);
        }
      }
    });
  }

  _hosts(system, instances) {
    if (instances.length >= 1) {
      var hosts = system.hosts;
      if (hosts.length == 0) {
        var instance = instances[0];
        hosts = ['azk-agent:' + instance.Ports[0].PublicPort];
      }
      return hosts.join(', ');
    }
    return "";
  }

  status(manifest, systems, opts) {
    return async(this, function* () {
      this.output("Systems status: ")
      for (var system of systems) {
        var instances = yield system.instances(opts.all);
        this.tOutput("commands.status.status", {
          system: system.name,
          instances: instances.length,
          hosts: this._hosts(system, instances),
        });
      }
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
  (new Cmd('start', cli))
    .addOption(['--system', '-s'], { type: String });

  // TODO: Add kill
  (new Cmd('stop', cli))
    .addOption(['--system', '-s'], { type: String });

  (new Cmd('scale', cli))
    .addOption(['--system', '-s'], { type: String })
    .addOption(['--instances', '-n'], { type: Number, default: 1 });

  (new Cmd('status', cli))
    .addOption(['--system', '-s'], { type: String, default: ":all" })
    .addOption(['--all', '-a'], { default: false });

  (new Cmd('reload', cli))
    .addOption(['--system', '-s'], { type: String });

  (new Cmd('up', cli));
}
