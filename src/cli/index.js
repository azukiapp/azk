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
      .route('agent', (p, args) => p.agent && /(start|status|stop|configure)/.test(args))
      .route('vm', (p, args) => p.vm && /(ssh|start|status|installed|stop|remove)/.test(args))
      .route('config', (p, args) => p.config && /(track-toggle|track-status)/.test(args))
      .route('docker')
      .route('doctor')
      .route('info')
      .route('init')
      .route('scale')
      .route('shell')
      .route('status')
      .route('start')
      .route('restart', (p) => p.restart, 'start.index')
      .route('stop'   , (p) => p.stop   , 'start.index')
      .route('logs')
      .route('help'); // If you do not fall in any other route, the help is called.

    result = azk_cli.run({
      argv: args.slice(2)
    }, {
      args: args.slice(2),
      ui  : ui,
      cwd : process.cwd()
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
