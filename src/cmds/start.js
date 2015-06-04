import Scale from 'azk/cmds/scale';
import { _, lazy_require } from 'azk';
import { async } from 'azk/utils/promises';
import { SYSTEMS_CODE_ERROR } from 'azk/utils/errors';

var lazy = lazy_require({
  open: 'open',
});

var action_opts = {
  start: { instances: {}, key: "already_started" },
  stop:  { instances: 0 , key: "not_running" },
};

class Start extends Scale {
  _scale(systems, action, opts) {
    var scale_options = action_opts[action];

    opts.instances = opts.instances || {};

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
        var icc = yield super._scale(system, instances, opts);

        if (icc === 0) {
          this.ui.fail([...ns].concat(scale_options.key), system);
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
      if (opts.open) {
        var open_with;
        var system;
        var system_name = opts.system && opts.system.split(',');
        system_name = _.head(system_name || []);
        if (system_name) {
          system = _.head(_.filter(systems, (s) => s.name === system_name));
        }
        system = system || manifest.systemDefault;

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
            lazy.open(system.url, open_with);
          } else {
            this.ui.warning(`${tKey}.system_not_running`, tOpt);
          }
        } else {
          this.ui.warning(`${tKey}.default_system_not_balanceable`, tOpt);
        }
      }

      return result;
    })
    .catch((error) => {
      this.ui.fail(error);
      this.ui.fail('commands.start.fail', error);
      return this
        .stop(manifest, systems, opts)
        .then(() => { return error.code ? error.code : 127; });
    });
  }

  stop(manifest, systems, opts) {
    systems = systems.reverse();
    return this._scale(systems, 'stop', opts);
  }

  restart(manifest, systems, opts) {
    return async(this, function* () {
      var scale_options = _.clone(opts);
      scale_options.instances = scale_options.instances || {};

      // save instances count
      for (var system of systems) {
        var instances = yield system.instances({ type: "daemon" });
        scale_options.instances[system.name] = instances.length;
      }

      yield this.stop(manifest, systems, opts);
      return this.start(manifest, systems, scale_options);
    });
  }
}

module.exports = Start;
