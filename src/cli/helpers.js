import { _, log, lazy_require, config, t } from 'azk';
import { isBlank } from 'azk/utils';
import { async, promiseResolve } from 'azk/utils/promises';
import { SmartProgressBar } from 'azk/cli/smart_progress_bar';
import { ManifestError } from 'azk/utils/errors';
import CrashReportUtil from 'azk/configuration/crash_report';
import Configuration from 'azk/configuration';
import { InvalidCommandError } from 'azk/utils/errors';

var lazy = lazy_require({
  AgentClient: ['azk/agent/client', 'Client'],
  Configure: ['azk/agent/configure', 'Configure'],
});

var Helpers = {
  requireAgent(cli) {
    return lazy.AgentClient
      .status()
      .then((status) => {
        if (!status.agent && cli.isInteractive()) {
          var question = {
            type    : 'confirm',
            name    : 'start',
            message : 'commands.agent.start_before',
            default : true
          };

          return cli.prompt(question)
            .then((answers) => {
              var cmd = "azk agent start";
              return answers.start ? cli.execSh(cmd) : false;
            });
        }
      })
      .then(() => {
        return lazy.AgentClient.require();
      });
  },

  checkBooleanArgument(str_arg) {
    if (typeof str_arg === 'undefined' || str_arg === null) {
      // was not informed
      return undefined;
    }

    str_arg = str_arg.toLowerCase(str_arg);

    if (str_arg === 'on' ||
        str_arg === 'true' ||
        str_arg === '1') {
      return true;
    }

    if (str_arg === 'off' ||
        str_arg === 'false' ||
        str_arg === '0') {
      return false;
    }

    if (str_arg === 'null' ||
        str_arg === 'undefined' ||
        str_arg === 'none' ||
        str_arg === 'blank' ||
        str_arg === 'reset') {
      return null;
    }

    throw new InvalidCommandError(str_arg);
  },

  askTermsOfUse(cli, force = false) {
    return async(this, function* () {
      let configuration = new Configuration({});
      let email_ask_count = configuration.load('terms_of_use.ask_count');
      let terms_accepted = configuration.load('terms_of_use.accepted');


      // exit: no need to ask, terms already accepted
      if (terms_accepted && !force) {
        return true;
      }

      if (isBlank(email_ask_count)) {
        email_ask_count = 0;
      }

      if (email_ask_count === 0) {
        // only first time
        terms_accepted = yield this.askConfirmation(cli, 'terms_of_use.first_question');
      } else if (email_ask_count > 0){
        terms_accepted = yield this.askConfirmation(cli, 'terms_of_use.you_need_question');
      }
      // save accepted
      configuration.save('terms_of_use.accepted', terms_accepted);

      // save ask_count
      email_ask_count = email_ask_count + 1;
      configuration.save('terms_of_use.ask_count', email_ask_count);

      return terms_accepted;
    });
  },

  askConfirmation(cli, translation_path, default_bool = true) {
    var question = {
      type    : 'confirm',
      name    : 'boolean_result',
      message : translation_path,
      default : default_bool
    };

    return cli.prompt(question)
    .then((response) => {
      return promiseResolve(response.boolean_result);
    });
  },

  askToSendError(cli) {
    return async(this, function* () {
      let crashReportUtil = new CrashReportUtil({});
      let is_interactive = cli.isInteractive();
      let always_send_crash_reports = crashReportUtil.loadCrashReportAlwaysSend(); // Boolean or undefined

      if (!is_interactive) {
        // exit 1: if it is not interactive
        // respect saved configuration
        log.debug(`[crash-report] exit: is_interactive: ${is_interactive}`);
        return always_send_crash_reports === true;
      }

      if (always_send_crash_reports === false) {
        // exit 2: if user does not want to send crash-reports, skip the rest
        // do not send
        log.debug(`[crash-report] exit: always_send_crash_reports: ${always_send_crash_reports}`);
        return false;
      }

      if (isBlank(always_send_crash_reports)) {
        // opt-out: if always_send_crash_reports is not set is true
        always_send_crash_reports = true;
      }

      // question 1: ask email
      yield this._askEmailIfNeeded(cli);

      return true;
    });

  },

  // email
  _askEmailIfNeeded(cli) {
    return async(this, function* () {

      let configuration = new Configuration();
      let current_saved_email = configuration.load('user.email');
      let never_ask_email = configuration.load('user.email.never_ask');
      let email_ask_count = configuration.load('user.email.ask_count');

      log.debug(`[crash-report] _askEmailIfNeeded - never_ask_email: ${never_ask_email}`);
      log.debug(`[crash-report] _askEmailIfNeeded - current_saved_email: ${current_saved_email}`);
      log.debug(`[crash-report] _askEmailIfNeeded - email_ask_count: ${email_ask_count}`);

      if (never_ask_email === true) {
        // do not ask email and send
        return false;
      } else {
        // ask for user email if it is not set yet
        // user have to has the "bug report sending configuration" active or not set
        let inputed_email = yield this.askEmail(cli, current_saved_email);

        if (inputed_email && inputed_email.length > 0) {
          // save current settings
          configuration.save('user.email', inputed_email);
          current_saved_email = inputed_email;
        } else {
          // check how many time user has been asked about email
          if (isBlank(email_ask_count)) {
            email_ask_count = 0;
          }
          email_ask_count = email_ask_count + 1;
          configuration.save('user.email.ask_count', email_ask_count);

          // if user did not answer email two times
          // lets suggest to not ask again
          if (email_ask_count > 1) {
            let will_ask_again = yield this.askEmailEverytime(cli);
            configuration.save('user.email.never_ask', !will_ask_again);
          }
        }
        return true;
      }
    });
  },

  askCrashReportToggle(cli) {
    const ENABLE_CONFIG = t('crashReport.save_autosend.choice_enable');
    const DISABLE_CONFIG = t('crashReport.save_autosend.choice_disable');
    const CLEAR_CONFIG = t('crashReport.save_autosend.choice_clear');

    var question = {
      type    : 'rawlist',
      name    : 'result',
      message : 'crashReport.save_autosend.question',
      default : '1',
      choices : [ENABLE_CONFIG,
                 DISABLE_CONFIG,
                 CLEAR_CONFIG]
    };

    return cli.prompt(question)
    .then((response) => {
      if (response.result === ENABLE_CONFIG) {
        return promiseResolve(true);
      } else if (response.result === DISABLE_CONFIG) {
        return promiseResolve(false);
      } else if (response.result === CLEAR_CONFIG) {
        return promiseResolve(null);
      }
    });
  },

  askEmail(cli, current_email = undefined) {
    var question = {
      type    : 'input',
      name    : 'result',
      message : 'crashReport.email.question',
      default : current_email
    };

    let validateEmail = (str_email) => {
      return /[^\\.\\s@][^\\s@]*(?!\\.)@[^\\.\\s@]+(?:\\.[^\\.\\s@]+)*/.test(str_email);
    };

    if (current_email === 'null') {
      cli.ok('commands.config.email-reset-to-null');
      return promiseResolve(undefined);
    } else if (current_email && current_email.length > 0) {
      if (validateEmail(current_email)) {
        // cli.ok('commands.config.email-valid', { email: current_email });
        return promiseResolve(current_email);
      } else {
        cli.ok('commands.config.email-not-valid', { email: current_email });
      }
    }

    return cli.prompt(question)
    .then((prompt_result) => {
      var input_email = prompt_result.result;
      if (input_email.length === 0) {
        cli.ok('commands.config.email-reset-to-null');
        return promiseResolve(undefined);
      } else {
        if (validateEmail(input_email)) {
          cli.ok('commands.config.email-current', { email: input_email });
          return promiseResolve(input_email);
        } else {
          cli.ok('commands.config.email-not-valid', { email: input_email });
          return Helpers.askEmail(cli);
        }
      }
    });
  },

  askAlwaysSendCrashReport(cli) {
    var question = {
      type    : 'confirm',
      name    : 'result',
      message : 'crashReport.question_remember_email_and_crashReport',
      default : true
    };

    return cli.prompt(question)
    .then((response) => {
      if (response.result) {
        cli.ok('crashReport.remember_choice_yes');
      } else {
        cli.ok('crashReport.remember_choice_no');
      }
      return promiseResolve(response.result);
    });
  },

  askEmailEverytime(cli) {
    var question = {
      type    : 'confirm',
      name    : 'result',
      message : 'crashReport.email.question_never_ask_email',
      default : true
    };

    return cli.prompt(question)
    .then((response) => {
      return promiseResolve(response.result);
    });
  },

  configure(cli) {
    cli.ok('configure.loading_checking');
    return (new lazy.Configure(cli))
      .run()
      .then((configs) => {
        cli.ok('configure.loaded');
        return configs;
      });
  },

  manifestValidate(cmd, manifest) {
    var validation_errors = manifest.validate();
    if (validation_errors.length === 0) { return; }

    // has deprecate errors?
    if (config('flags:show_deprecate')) {
      var deprecate_val_errors = _.filter(validation_errors, function (item) {
        return item.level === 'deprecate';
      });
      _.each(deprecate_val_errors, (deprecate_val_error) => {
        cmd.deprecate(`manifest.validate.${deprecate_val_error.key}`, deprecate_val_error);
      });
    }

    // has fails level errors?
    var val_errors = _.filter(validation_errors, function (item) {
      return item.level === 'fail';
    });

    if (config('flags:show_deprecate')) {
      _.each(val_errors, (val_error) => {
        var msg = t(`manifest.validate.${val_error.key}`, val_error);
        throw new ManifestError(this.file, msg);
      });
    }
  },

  vmStartProgress(cmd) {
    return (event) => {
      if (!event) {
        return;
      }

      var tKey    = null;
      var context = event.context || "agent";
      var keys    = ["status", context];

      switch (event.type) {
        case "status":
          // running, starting, not_running, already_installed
          switch (event.status) {
            case "not_running":
            case "already_installed":
            case "down":
              cmd.fail([...keys].concat(event.status), event.data);
              break;
            case "error":
              if (event.data instanceof Error) {
                cmd.fail(event.data.toString());
              } else {
                cmd.fail([...keys].concat(event.status), event);
              }
              break;
            default:
              if (event.keys) {
                cmd[event.status || "ok"](event.keys, event.data);
              } else {
                cmd.ok([...keys].concat(event.status), event.data);
              }
          }
          break;
        case "wait_port":
          tKey = ["status", event.system, "wait"];
          log.info_t(tKey, event);
          cmd.ok(tKey, event);
          break;
        case "try_connect":
          if (context === "balancer") {
            tKey = [...keys].concat("progress");
            log.info_t(tKey, event);
            cmd.ok(tKey, event);
          }
          break;
        case "ssh":
          if (context === "stderr") {
            break;
          } else {
            log.debug({ log_label: "[vm_progress] [ssh]", data: event});
          }
          break;
        default:
          log.debug({ log_label: "[vm_progress]", data: event});
      }
    };
  },

  newPullProgressBar(cmd) {
    return (msg) => {
      if (msg.type !== "pull_msg") {
        return msg;
      }

      // pull end
      if (msg.end) {
        cmd.ok('commands.helpers.pull.pull_ended', msg);
        return false;
      }

      // manual message, not parsed
      if (msg.traslation) {
        cmd.ok(msg.traslation, msg.data);
        return false;
      }

      if (!_.isNumber(this.non_existent_locally_ids_count)) {
        this.non_existent_locally_ids_count = msg.registry_result.non_existent_locally_ids_count;
      }

      // parse messages by type
      var status = msg.statusParsed;
      switch (status.type) {
        case 'download_complete':
          this.smartProgressBar && this.smartProgressBar.receiveMessage(msg, status.type);
          break;

        case 'download':
          if (_.isUndefined(this.bar)) {
            // show message: ⇲ pulling 5/14 layers.
            cmd.ok('commands.helpers.pull.pull_start', {
              left_to_download_count : msg.registry_result.non_existent_locally_ids_count,
              total_registry_layers  : msg.registry_result.registry_layers_ids_count,
            });

            // create a new progress-bar
            this.bar = cmd.createProgressBar('     [:bar] :percent :layers_left/:layers_total ', {
              complete: '=',
              incomplete: ' ',
              width: 50,
              total: 50
            });

            // control progress-bar with SmartProgressBar
            this.smartProgressBar = new SmartProgressBar(
              50,
              this.non_existent_locally_ids_count,
              this.bar);
          }
          this.smartProgressBar.receiveMessage(msg, status.type);
          break;

        case 'pulling_another':
          cmd.ok('commands.helpers.pull.already_being', msg);
          break;
      }
      return false;
    };
  },

  escapeCapture(callback) {
    // Escape sequence
    var escapeBuffer = false;
    var escape = false;

    return (event) => {
      if (event.type == "stdin_pipe") {
        var stdin  = event.data[0].stdin;
        var stream = event.data[0].stream;
        var container = event.id;
        var stopped = false;

        stdin.on('data', function (key) {
          if (stopped) {
            return false;
          }

          var ch = key.toString(stdin.encoding || 'utf-8');

          if (escapeBuffer && ch === '~') {
            escapeBuffer = false;
            escape = true;
          } else if (ch === '\r') {
            escapeBuffer = true;
            stream.write(key);
          } else {
            if (escape) {
              stopped = callback(ch, container, () => stopped = false);
              escape = false;
            } else {
              stream.write(key);
            }
            escapeBuffer = false;
          }
        });
      }
      return true;
    };
  }
};

export { Helpers };
