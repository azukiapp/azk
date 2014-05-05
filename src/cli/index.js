import { _, Q } from 'azk';
import { Cli } from 'azk/cli/cli';
import { UI } from 'azk/cli/ui';

var path = require('path');
var cmds_path = path.join(__dirname, "..", "cmds");

export function cli(args, ui = UI) {
  var azk_cli = new Cli('azk', ui, cmds_path);
  var result  = azk_cli.run(_.rest(args, 2));
  if (Q.isPromise(result)) {
    result.then((code) => {
      ui.exit(code ? code : 0);
    }, (error) => {
      console.log(error.stack ? error.stack : error);
      ui.exit(127);
    });
  }
}
