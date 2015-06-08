import { _, lazy_require } from 'azk';
import { async } from 'azk/utils/promises';
import { InteractiveCmds } from 'azk/cli/interactive_cmds';
import { Helpers } from 'azk/cli/command';

var lazy = lazy_require({
  Manifest: ['azk/manifest'],
  prettyjson: 'prettyjson'
});

class Cmd extends InteractiveCmds {
  action(opts) {
    return async(this, function* () {

      // Requirements
      yield Helpers.requireAgent(this);
      var manifest = new lazy.Manifest(this.cwd, true);

      // Mount data to show
      var data = _.reduce(manifest.systems, (data, system) => {
        var obj = {};
        obj[system.image.provider] = system.image.name;
        var system_data = {
          depends : system.options.depends,
          image   : obj,
          command : this._format_command(system.command),
          ports   : system.ports,
        };

        // Adjust
        if (_.isEmpty(system_data.depends)) {
          system_data.depends = 'no dependencies'.cyan;
        }

        if (_.isEmpty(system_data.ports)) {
          delete system_data.ports;
        }

        data.systems[system.name.yellow] = system_data;
        return data;
      }, {
        manifest: manifest.file,
        manifest_id: manifest.namespace,
        cache_dir: manifest.cache_dir,
        default_system: manifest.systemDefault.name,
        systems: {}
      });

      // Show result
      this.output(lazy.prettyjson.render(data, {
        noColor: opts.colored ? false : true,
        dashColor: "magenta",
        stringColor: "blue",
      }));

      return 0;
    });
  }

  _format_command(commands) {
    commands = _.map(commands, (cmd) => {
      return (cmd.match(/\s/)) ? `"${cmd.replace(/\"/g, '\\"')}"` : cmd;
    });
    return commands.join(" ");
  }
}

export function init(cli) {
  return (new Cmd('info', cli))
    .addOption(['--colored', '-C'], { default: true });
}
