import { _, async } from 'azk';
import { SYSTEMS_CODE_ERROR } from 'azk/utils/errors';
import { Cmd as ScaleCmd } from 'azk/cmds/scale';

var open = require('open');

var action_opts = {
  start: { instances: {}, key: "already_started" },
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

      while ( (system = systems.shift()) ) {
        var ns = ["commands", action], instances;

        if (action == "start") {
          // The number of instances is not set to system.name use "{}"
          instances = _.defaults(opts.instances[system.name], _.clone(scale_options.instances));
        } else {
          instances = _.clone(scale_options.instances);
        }

        // Force start scalable = { default: 0 }
        // Only if specified
        if (!(opts.systems) && action == "start" && _.isObject(scale_options.instances)) {
          if (system.scalable.default === 0 && !system.disabled) {
            instances = 1;
          }
        }

        this.verbose([...ns].concat("verbose"), system);
        var icc = yield super(system, instances, opts);

        if (icc === 0) {
          this.fail([...ns].concat(scale_options.key), system);
          result = SYSTEMS_CODE_ERROR;
        }
      }

      return result;
    });
  }

  start(manifest, systems, opts) {
    return async(this, function* () {
      var result = yield this._scale(systems, 'start', opts);

      // if flag --open
      if (!_.isUndefined(opts.open)) {
        var open_with;
        var system = manifest.systemDefault;
        var tKey   = 'commands.start.option_errors.open';
        var tOpt   = { name : system.name };

        if (_.isNull(opts.open) || !_.isString(opts.open) ) {
          open_with = null;
        } else {
          open_with = opts.open;
        }

        if (system.balanceable) {
          var instances = yield system.instances({ type: "daemon" });

          if (instances.length > 0) {
            open(system.url, open_with);
          } else {
            this.warning(`${tKey}.system_not_running`, tOpt);
          }

        } else {
          this.warning(`${tKey}.default_system_not_balanceable`, tOpt);
        }
      }

      return result;
    })
    .fail((error) => {
      this.fail(error);
      this.fail('commands.start.fail', error);
      return this
        .stop(manifest, systems, opts)
        .then(() => { return error.code ? error.code : 127; });
    });
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
  var cmds = {
    start   : (new Cmd('start [system]'   , cli))
                .addOption(['--reprovision', '-R'], { default: false })
                .addOption(['--rebuild', '--pull', '-B'], { default: false })
                .addOption(['--open', '-o'], { type: String, placeholder: "application" }),
    stop    : (new Cmd('stop [system]'    , cli))
                .addOption(['--remove', '-r'], { default: true }),
    restart : (new Cmd('restart [system]' , cli))
                .addOption(['--reprovision', '-R'], { default: false })
                .addOption(['--rebuild', '--pull', '-B'], { default: false })
                .addOption(['--open', '-o'], { type: String, placeholder: "application" }),
    reload  : (new Cmd('reload [system]'  , cli))
                .addOption(['--reprovision', '-R'], { default: true }),
  };

  return cmds;
}
