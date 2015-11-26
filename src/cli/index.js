import { _, log } from 'azk';
import { promiseResolve, promiseReject, isPromise } from 'azk/utils/promises';
import { Cli as AzkCli } from 'azk/cli/cli';
import { Helpers } from 'azk/cli/helpers';
import { UI } from 'azk/cli/ui';
import { InvalidCommandError } from 'azk/utils/errors';
import CrashReportUtil from 'azk/configuration/crash_report';

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
    .route('config', (p, args) => p.config && /(list|track-toggle|crash-report-toggle|email-set|email-never-ask-toggle)/.test(args))
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
      .then((code) => {
        if (code !== 0) {

          // FIXME: remove this?!
          log.error('ATTENTION: error were are not thrown');
          console.trace(`code: ${code}`);

          return ui.exit(code);
        }
        ui.exit(0);
      })
      .catch((error) => {
        var isError = error instanceof Error;
        if (!isError) {

          // FIXME: remove this?!
          log.error('ATTENTION: expected an error but get this:');
          console.trace(error);

          return ui.exit(1);
        }

        ui.fail(error);
        ui.warning('crashReport.message_error_occured');

        return Helpers.askToSendError(ui)
        .then((will_send_error) => {
          if (will_send_error) {
            ui.ok('crashReport.sending');
            log.debug(`[crash-report] sending...`);
            var crashReportUtil = new CrashReportUtil({}, ui.tracker);
            return crashReportUtil.sendError(error).then((result) => {
              ui.ok('crashReport.was_sent');
              log.debug(`[crash-report] Force response ${result && result.body}`);
              ui.exit(error.code ? error.code : 127);
            });
          }
        });

      })
      .then((code) => {
        ui.exit(code ? code : 0);
      });
  } else {
    ui.exit(result);
  }
}
