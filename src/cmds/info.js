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
      // Requirements
      yield Helpers.requireAgent(this.ui);
      var manifest = new lazy.Manifest(this.cwd, true);

      // Mount data to show
      var data = _.reduce(manifest.systems, (data, system) => {
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

        data.systems[this.ui.c.yellow(system.name)] = system_data;
        return data;
      }, {
        manifest_id   : manifest.namespace,
        manifest      : manifest.file,
        cache_dir     : manifest.cache_dir,
        default_system: manifest.systemDefault.name,
        systems       : {}
      });

      // Show result
      this.ui.output(lazy.prettyjson.render(data, {
        noColor: !this.ui.useColours(),
        dashColor: "magenta",
        stringColor: "blue",
      }));

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
