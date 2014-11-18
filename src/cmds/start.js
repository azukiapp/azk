import { log, _, async, config, t, lazy_require } from 'azk';
import { Command, Helpers } from 'azk/cli/command';
import { SYSTEMS_CODE_ERROR, NotBeenImplementedError } from 'azk/utils/errors';
import { Cmd as ScaleCmd } from 'azk/cmds/scale';

lazy_require(this, {
  Manifest: ['azk/manifest'],
});

var action_opts = {
  start: { instances: {}, key: "already" },
  stop:  { instances: 0 , key: "not_running" },
};

class Cmd extends ScaleCmd {
  _scale(systems, action, opts) {
    var scale_options = action_opts[action];

    opts = _.defaults(opts, {
      instances: {},
    });

    return async(this, function* () {
      var system, result = 0;
      systems = _.clone(systems);

      while(system = systems.shift()) {
        var ns = ["commands", action];

        if (action == "start") {
          // The number of instances is not set to system.name use "{}"
          var instances = _.defaults(opts.instances[system.name], _.clone(scale_options.instances));
        } else {
          var instances =_.clone(scale_options.instances);
        };

        // Force start scalable = { default: 0 }
        // Only if specified
        if (!(opts.systems) && action == "start" && _.isObject(scale_options.instances)) {
          if (system.scalable.default == 0 && !system.disabled) {
            instances = 1;
          }
        }

        this.verbose([...ns, "verbose"], system);
        var icc = yield super(system, instances, opts);

        if (icc == 0) {
          this.fail([...ns, scale_options.key], system);
          result = SYSTEMS_CODE_ERROR;
        }
      };

      return result;
    });
  }

  start(manifest, systems, opts) {
    return this._scale(systems, 'start', opts);
  }

  stop(manifest, systems, opts) {
    systems = systems.reverse();
    return this._scale(systems, 'stop', opts);
  }

  reload(manifest, systems, opts) {
    this.fail('commands.reload.deprecation');
    return this.restart(manifest, systems, opts);
  }

  restart(manifest, systems, opts) {
    return async(this, function* () {
      var scale_options = _.merge({
        instances: {}
      }, opts);

      // save instances count
      for (var system of systems) {
        var instances = yield system.instances({ type: "daemon" });
        scale_options.instances[system.name] = instances.length;
      }

      yield this.stop(manifest, systems, opts);
      yield this.start(manifest, systems, scale_options);
    });
  }
}

export function init(cli) {
  var cmds = [
    (new Cmd('start [system]' , cli))
      .addOption(['--reprovision', '-R'], { default: false }),
    (new Cmd('stop [system]'  , cli))
      .addOption(['--remove', '-r'], { default: true }),
    (new Cmd('restart [system]', cli))
      .addOption(['--reprovision', '-R'], { default: false }),
    (new Cmd('reload [system]', cli))
      .addOption(['--reprovision', '-R'], { default: true }),
  ];
}
