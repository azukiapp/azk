import { _, lazy_require, config } from 'azk';
import { promiseResolve, promiseReject, isPromise } from 'azk/utils/promises';
import { Cli as AzkCli } from 'azk/cli/cli';
import { UI } from 'azk/cli/ui';
import { InvalidCommandError } from 'azk/utils/errors';

var lazy = lazy_require({
  'BugSender': 'bug-report-sender',
  'request'  : 'request',
});

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
    .route('config', (p, args) => p.config && /(track-toggle|track-status)/.test(args))
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

var _sendErrorToBugReport = function(error_to_send, tracker) {
  // TODO: get infos like tracker
  var extra_values = {
    meta: {},
    server: {},
  };

  if (tracker && tracker.meta) {
    if (tracker.meta.device_info) {
      extra_values.server = tracker.meta.device_info;
    }
    if (tracker.meta.agent_session_id) {
      extra_values.meta.agent_session_id = tracker.meta.agent_session_id;
    }
    if (tracker.meta.command_id) {
      extra_values.meta.command_id = tracker.meta.command_id;
    }
    if (tracker.meta.user_id) {
      extra_values.meta.user_id = tracker.meta.user_id;
    }
    if (tracker.meta.azk_version) {
      extra_values.meta.azk_version = tracker.meta.azk_version;
    }
  }

  var endpoint_url = config('urls:force:endpoints:notice');

  var options = {
    err: error_to_send,
    extra_values: extra_values,
    libs: {requestFunction: lazy.request},
    url: endpoint_url,
  };

  var bugSender = new lazy.BugSender();
  return bugSender.send(options)
  .then(function(result) {
    // OK
  });
};

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
        ui.exit(code ? code : 0);
      })
      .catch((error) => {
        ui.fail(error);
        ui.info('sending bug report...');
        return _sendErrorToBugReport(error, ui.tracker).then((result) => {
          ui.info(`[force] bug report error response: ${result.body}`);
          ui.exit(error.code ? error.code : 127);
        })
        .catch((/*err*/) => {
          // ui.fail(err.error);
        });

      })
      .then((code) => {
        ui.exit(code ? code : 0);
      });
  } else {
    ui.exit(result);
  }
}
