import { CliTrackerController } from 'azk/cli/cli_tracker_controller.js';
import { Helpers } from 'azk/cli/helpers';
import { _, lazy_require } from 'azk';
import { async } from 'azk/utils/promises';

var lazy = lazy_require({
  Manifest  : ['azk/manifest'],
  prettyjson: 'prettyjson'
});

export default class Info extends CliTrackerController {
  index() {
    return async(this, function* () {
      let args = this.normalized_params.arguments;
      let options = this.normalized_params.options;

      // Requirements
      yield Helpers.requireAgent(this.ui);
      var manifest = new lazy.Manifest(this.cwd, true);
      Helpers.manifestValidate(this.ui, manifest);

      let systems = args.system;
      let show_manifest = _.isEmpty(systems);
      if (show_manifest) {
        systems = manifest.systems;
      } else {
        systems = manifest.getSystemsByName(systems);
      }

      let filters = options.filter;
      if (_.isEmpty(filters) || filters === "all" || filters === "*") {
        filters = [];
      } else {
        filters = options.filter.split(",");
      }

      // Mount data to show
      let systems_data = _.reduce(systems, (data, system) => {
        var obj = {};
        obj[system.image.provider] = system.image.name;
        var system_data = {
          depends : system.options.depends,
          image   : obj,
          command : this._format_command(system.command),
          hostname: this.ui.c.underline(system.url),
          ports   : system.ports,
          scalable: system.scalable,
          mounts  : system.mounts,
          envs    : system.envs,
        };

        // Adjust
        if (_.isEmpty(system_data.depends)) {
          system_data.depends = this.ui.c.cyan('no dependencies');
        }

        if (_.isEmpty(system_data.ports)) {
          delete system_data.ports;
        }

        // Filters
        if (!_.isEmpty(filters)) {
          system_data = _.reduce(system_data, (data, value, key) => {
            if (filters.indexOf(key) > -1) {
              data[key] = value;
            }
            return data;
          }, {});
        }

        data[this.ui.c.yellow(system.name)] = system_data;
        return data;
      }, {});

      // Include manifest global infos
      var data = systems_data;
      if (show_manifest) {
        data = {
          manifest_id   : manifest.namespace,
          manifest      : manifest.file,
          cache_dir     : manifest.cache_dir,
          default_system: manifest.systemDefault.name,
          systems       : data,
        };
      }

      // Show result
      if (options.json) {
        let keys = _.keys(data);
        if (keys.length === 1) { data = data[keys[0]]; }
        this.ui.output(JSON.stringify(data));
      } else {
        this.ui.output(lazy.prettyjson.render(data, {
          noColor: !this.ui.useColours(),
          dashColor: "magenta",
          stringColor: "blue",
        }));
      }

      return 0;
    });
  }

  _format_command(commands) {
    if (!_.isString(commands)) {
      commands = JSON.stringify(commands);
    }
    return commands;
  }
}
