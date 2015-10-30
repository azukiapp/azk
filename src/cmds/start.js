import Scale from 'azk/cmds/scale';
import { _, lazy_require } from 'azk';
import { async, promiseReject } from 'azk/utils/promises';

var lazy = lazy_require({
  GetProject: ['azk/manifest/get_project'],
});

var action_opts = {
  start: { instances: {}, key: "already_started" },
  stop:  { instances: 0 , key: "not_running" },
  skip_start: { key: "skip" },
  skip_stop: { key: "skip" },
};

class Start extends Scale {
  _scale(systems, action, opts) {
    var args = this.normalized_params.arguments;
    var args_systems = (args.system || '').split(',');
    args_systems = _.map(args_systems, (s) => (s || '').trim());

    opts.instances = opts.instances || {};

    return async(this, function* () {
      var system, result = 0;
      systems = _.clone(systems);

      while ( (system = systems.shift()) ) {
        var ui_status = 'fail';
        var scale_options = action_opts[action];
        var ns = ["commands", action], instances;
        system.force = _.contains(args_systems, system.name);

        if (action == "start") {
          // The number of instances is not set to system.name use "{}"
          instances = _.defaults(opts.instances[system.name], _.clone(scale_options.instances));
        } else {
          instances = _.clone(scale_options.instances);
        }

        // Force start if scalable.default == 0
        // Only if specified
        if (!system.auto_start) {
          if (system.force && action === 'start') {
            instances = 1;
          } else {
            scale_options = action_opts[`skip_${action}`];
            ui_status = 'warning';
          }
        }

        this.verbose([...ns].concat("verbose"), system);
        var icc = yield super._scale(system, instances, opts);

        if (icc === 0) {
          this.ui[ui_status]([...ns].concat(scale_options.key), system);
        }
      }

      return result;
    });
  }

  start(manifest, systems, opts) {
    return async(this, function* () {
      var result = yield this._scale(systems, 'start', opts);

      // if flag --open
      var open = this.normalized_params.options.open;
      if (open || opts['open-with']) {
        var open_with;
        var system;
        var system_name = opts.system && opts.system.split(',');
        system_name = _.head(system_name || []);
        if (system_name) {
          system = _.head(_.filter(systems, (s) => s.name === system_name));
        }
        system = system || manifest.systemDefault;

        var tKey   = 'commands.open';
        var tOpt   = { name : system.name };

        if (_.isString(opts['open-with']) ) {
          open_with = opts['open-with'];
        }

        if (system.balanceable) {
          var instances = yield system.instances({ type: "daemon" });

          if (instances.length > 0) {
            this.ui.open(system.url, open_with);
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
      this.ui.fail('commands.start.fail', error);
      return this.stop(manifest, systems, opts)
      .then(() => {
        return promiseReject(error);
      });
    });
  }

  stop(manifest, systems, opts) {
    systems = systems.reverse();
    return this._scale(systems, 'stop', opts);
  }

  restart(manifest, systems, opts) {
    return async(this, function* () {
      yield this.stop(manifest, systems, opts);
      return this.start(manifest, systems, opts);
    });
  }

  // GetProject: clone and start a project from a git repo
  getProject(opts) {
    var command_parse_result = lazy.GetProject.parseCommandOptions(opts);
    if (command_parse_result) {
      var getter = new lazy.GetProject(this.ui, command_parse_result);
      return getter.startProject(command_parse_result)
      .then(() => {
        opts.system = null;

        // call scale
        return this.index(opts, command_parse_result)
        .then(() => {
          this.ui.ok('commands.start.get_project.final_started_message', {
            git_destination_path: command_parse_result.git_destination_path
          });
        });
      });
    }
  }
}

module.exports = Start;
