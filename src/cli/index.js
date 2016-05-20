import { _, log } from 'azk';
import { promiseResolve, promiseReject, isPromise } from 'azk/utils/promises';
import { Cli as AzkCli } from 'azk/cli/cli';
import { UI } from 'azk/cli/ui';
import { InvalidCommandError, UnknownError } from 'azk/utils/errors';
import { handler as error_handler } from 'azk/cli/error_handler';

export class Cli extends AzkCli {
  invalidCmd(error) {
    this.fail("commands.not_found", error.command);
    this.showUsage();
    return promiseResolve(1);
  }
}

function make_cli() {
  return new Cli()
    // Options
    .route('help', (p, args) => p.help || p['--help'] || _.isEmpty(args))
    .route('version', (p) => p.version || p['--version'])
    // Commands
    .route('agent', (p, args) => p.agent && /(start|status|stop|configure)/.test(args))
    .route('vm', (p, args) => p.vm && /(ssh|start|status|installed|stop|remove)/.test(args))
    .route('config', (p, args) => p.config && /(list|reset|set)/.test(args))
    .route('deploy')
    .route('docker')
    .route('doctor')
    .route('info')
    .route('init')
    .route('open')
    .route('scale')
    .route('shell')
    .route('status')
    .route('start', (p) => {
      var is_start_url_system = /.*[/].*/g.test(p["<system>"]);
      var has_git_repo_option = p["<git-repo>"] !== null;
      return is_start_url_system || has_git_repo_option;
    }, 'start.getProject')
    .route('start')
    .route('restart', (p) => p.restart , 'start.index')
    .route('stop'   , (p) => p.stop    , 'start.index')
    .route('logs')
    .route('help'); // If you do not fall in any other route, the help is called.
}

export function run(args, cwd, ui) {
  var cli = make_cli();
  return [cli, cli.run({
    argv: args
  }, {
    args: args,
    ui  : ui,
    cwd : process.cwd()
  })];
}

export function cli(args, cwd, ui = UI) {
  var result, azk_cli;
  try {
    args = args.slice(2);
    [azk_cli, result] = run(args, cwd, ui = UI);
  } catch (e) {
    result = (e instanceof InvalidCommandError) ?
      azk_cli.invalidCmd(e) : promiseReject(e);
  }

  if (isPromise(result)) {
    result
      .then((code_or_err) => {
        // Convert a not number in a UnknownError
        if (!_.isNumber(code_or_err)) {
          log.warn('[cli] command not return error or code, return: %j', code_or_err);
          // If is undefined, skip throwing the exception
          if (_.isUndefined(code_or_err)) {
            return 0;
          }
          throw new UnknownError(code_or_err);
        }
        return code_or_err;
      })
      .catch((error) => {
        return error_handler(error, { ui });
      })
      .then((code) => {
        ui.exit(_.isNumber(code) ? code : 1);
      });
  } else {
    ui.exit(result);
  }
}
