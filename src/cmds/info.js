import { _, async, config, lazy_require } from 'azk';
import { Command } from 'azk/cli/command';

lazy_require(this, {
  Manifest() {
    return require('azk/manifest').Manifest;
  },
  prettyjson() {
    return require('prettyjson');
  }
});

class Cmd extends Command {
  action(opts) {
    return async(this, function* () {
      var manifest = new Manifest(this.cwd, true);
      var options  = {
        noColor: opts.colored ? false : true,
        dashColor: "magenta",
        stringColor: "blue",
      }

      _.each(manifest.systems, (system) => {
        var data = {
          [system.name]: {
            depends: system.options.depends,
            image: system.image.name,
            command: this._format_command(system.command),
            ports: system.ports,
          }
        }
        this.output(prettyjson.render(data, options));
        this.output();
      });

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

