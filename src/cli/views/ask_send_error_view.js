import { _, t, isBlank, lazy_require } from 'azk';
import { View } from './view';
import { async, promiseResolve } from 'azk/utils/promises';

var lazy = lazy_require({
  Configuration: ['azk/configuration'],
  validator    : 'validator',
});

export class AskSendErrorView extends View {
  constructor(ui, configuration) {
    super(ui);
    this._configuration = configuration;
  }

  get configuration() {
    if (isBlank(this._configuration)) {
      this._configuration = new lazy.Configuration();
    }
    return this._configuration;
  }

  askToSend(options = {}) {
    let always_send = options.always_send;
    if (!_.isBoolean(always_send)) {
      always_send = this.configuration.load('crash_reports.always_send', true);
    }

    // Skip send?
    if (!always_send) {
      return promiseResolve(false);
    }

    this.warning('crashReport.message_error_occured');
    return (this.isInteractive()) ? this._checkEmail() : promiseResolve(true);
  }

  askEmail(current_email = undefined) {
    let question = {
      type    : 'input',
      name    : 'result',
      message : 'crashReport.email.question',
      default : current_email,
      validate: (value) => {
        return (value.length === 0 || this._validateEmail(value)) ?
          true : t('commands.config.email_not-valid', { email: value });
      }
    };

    return this.prompt(question).then((prompt_result) => {
      var email = prompt_result.result;
      if (email === null || email.length === 0) {
        this.ok('commands.config.email_reset-to-null');
        return undefined;
      } else {
        this.ok('commands.config.email_current', { email });
        return email;
      }
    });
  }

  askEmailEverytime() {
    var question = {
      type    : 'confirm',
      name    : 'result',
      message : 'crashReport.email.question_always_ask_email',
      default : true
    };

    return this.prompt(question).then((response) => {
      return response.result;
    });
  }

  _validateEmail(str_email) {
    return lazy.validator.isEmail(str_email);
  }

  _checkEmail() {
    return async(this, function* () {
      let always_ask_email = this.configuration.load('user.email_always_ask');
      let email = this.configuration.load('user.email');

      // ask for user email if current e-mail not set
      // user have to has the "bug report sending configuration" active or not set
      if (always_ask_email !== false && isBlank(email)) {
        email = yield this.askEmail(email);

        // save current settings
        if (!isBlank(email)) {
          // save e-mail
          this.configuration.save('user.email', email);
          this.configuration.save('user.email_always_ask', 0);
        } else {
          // check how many time user has been asked about email
          let email_ask_count = this.configuration.load('user.email_ask_count', 0);
          this.configuration.save('user.email_ask_count', ++email_ask_count);

          // if user did not answer email two times
          // lets suggest to not ask again
          if (email_ask_count > 1) {
            let will_ask_again = yield this.askEmailEverytime();
            this.configuration.save('user.email_always_ask', will_ask_again);
          }
        }
      }

      return true;
    });
  }
}
