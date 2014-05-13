import { _, Q, log } from 'azk';
import { Cli } from 'azk/cli/cli';
import { UI } from 'azk/cli/ui';

var path = require('path');
var cmds_path = path.join(__dirname, "..", "cmds");

class CmdCli extends Cli {
  action(opts, parent_opts) {
    // Set log level
    if (opts.log) {
      log.setConsoleLevel(opts.log);
    }
    log.info('Call cli action');
    return super(opts, parent_opts);
  }
}

export function cli(args, cwd, ui = UI) {
  var azk_cli = new CmdCli('azk', ui, cmds_path);
  azk_cli.addOption(['--log', '-l'], { type: String });

  azk_cli.cwd = cwd;
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
