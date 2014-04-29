import { _ } from 'azk';
import { Cli } from 'azk/cli/cli';
import { UI } from 'azk/cli/ui';

var path = require('path');
var cmds_path = path.join(__dirname, "..", "cmds");

export function cli(args, ui = new UI()) {
  var azk_cli = new Cli('azk', ui, cmds_path);
  azk_cli.run(_.rest(args, 2));
}
