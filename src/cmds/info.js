import { _, async, config, lazy_require } from 'azk';
import { Command, Helpers } from 'azk/cli/command';

lazy_require(this, {
  Manifest: ['azk/manifest'],
  prettyjson: 'prettyjson',
});

class Cmd extends Command {
  action(opts) {
    return async(this, function* () {

      // Requirements
      yield Helpers.requireAgent();
      var manifest = new Manifest(this.cwd, true);

      // Mount data to show
      var data = _.reduce(manifest.systems, (data, system) => {
        var system_data = {
          depends : system.options.depends,
          image   : system.image.name,
          command : this._format_command(system.command),
          ports   : system.ports,
        };

        // Adjust
        if (_.isEmpty(system_data.depends)) {
          system_data.depends = 'no dependencies'.cyan
        }

        if (_.isEmpty(system_data.ports)) {
          delete system_data.ports;
        }

        data.systems[system.name.yellow] = system_data;
        return data;
      }, {
        manifest: manifest.file,
        cache_dir: manifest.cache_dir,
        default_system: manifest.systemDefault.name,
        systems: {}
      });

      // Show result
      this.output(prettyjson.render(data, {
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
    .addOption(['--colored', '-C'], { default: true })
}

