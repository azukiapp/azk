import { _, async, config } from 'azk';
import { Command } from 'azk/cli/command';
import { Manifest } from 'azk/manifest';

var prettyjson = require('prettyjson');

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
            depends: system.depends,
            image: system.image.name,
            command: system.command,
          }
        }
        this.output(prettyjson.render(data, options));
        this.output();
      });

      return 0;
    });
  }
}

export function init(cli) {
  return (new Cmd('info', cli))
    .addOption(['--colored', '-C'], { default: true })
}

