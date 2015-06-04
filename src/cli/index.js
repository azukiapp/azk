import { _ } from 'azk';
import { promiseResolve, promiseReject, isPromise } from 'azk/utils/promises';
import { Cli as AzkCli } from 'azk/cli/cli';
import { UI } from 'azk/cli/ui';
import { InvalidCommandError } from 'azk/utils/errors';

export class Cli extends AzkCli {
  invalidCmd(error) {
    this.fail("commands.not_found", error.command);
    this.showUsage();
    return promiseResolve(1);
  }
}

export function cli(args, cwd, ui = UI) {
  var result;
  try {
    var azk_cli = new Cli();
    azk_cli
      // Options
      .route('help', (p, args) => p.help || p['--help'] || _.isEmpty(args))
      .route('version', (p) => p.version || p['--version'])
      // Commands
      .route('agent')
      .route('vm')
      .route('config')
      .route('docker')
      .route('doctor')
      .route('info')
      .route('init')
      .route('scale')
      .route('status')
      .route('logs')
      .route('help'); // If you do not fall in any other route, the help is called.

    result = azk_cli.run({
      argv: args.slice(2)
    }, {
      ui: ui,
      cwd: process.cwd()
    });
  } catch (e) {
    result = (e instanceof InvalidCommandError) ?
      azk_cli.invalidCmd(e) : promiseReject(e);
  }

  if (isPromise(result)) {
    result
      .then((code) => {
        ui.exit(code ? code : 0);
      })
      .catch((error) => {
        ui.fail(error);
        ui.exit(error.code ? error.code : 127);
      });
  } else {
    ui.exit(result);
  }
}
