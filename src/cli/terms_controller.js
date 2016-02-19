import { CliController } from 'azk/cli/cli_controller';
import { isBlank, lazy_require } from 'azk/utils';
import { log, config } from 'azk';
import { async, promiseResolve, promiseReject } from 'azk/utils/promises';
import { MustAcceptTermsOfUse } from 'azk/utils/errors';

var lazy = lazy_require({
  Configuration: ['azk/configuration'],
});

export class TermsController extends CliController {
  constructor(...args) {
    super(...args);
    this.require_terms = (config('flags:require_accept_use_terms') === true);
  }

  get configuration() {
    if (isBlank(this._configuration)) {
      this._configuration = new lazy.Configuration();
    }
    return this._configuration;
  }

  before_action_tracker(action_name, params) {
    return this.askTermsOfUse(params).then((accepted) => {
      if (accepted !== true) {
        return promiseReject(new MustAcceptTermsOfUse());
      }
    });
  }

  askTermsOfUse(cli_params, namespace = 'terms_of_use') {
    return async(this, function* () {
      // exit: accepting terms is required?
      if (!this.require_terms) {
        log.debug('[askTermsOfUse] exit: flags.require_accept_use_terms');
        return true;
      }

      let terms_accepted = this.configuration.load(`${namespace}.accepted`, false);

      // exit: not interactive code will not ask, but respect terms_accepted
      if (!this.ui.isInteractive()) {
        log.debug('[askTermsOfUse] not ask because !this.ui.isInteractive()');
        return terms_accepted;
      }

      // exit: no need to ask, terms already accepted
      if (terms_accepted) {
        log.debug('[askTermsOfUse] exit: terms_accepted: ' + terms_accepted);
        return true;
      }

      // load ask_count
      let terms_ask_count = this.configuration.load(`${namespace}.ask_count`);
      if (isBlank(terms_ask_count)) {
        terms_ask_count = 0;
      }

      // select and run question about the accept terms of use
      var question = (terms_ask_count === 0) ? 'first_question' : 'you_need_question';
      var response = yield this.askConfirmation(`${namespace}.${question}`);

      // save response and increment ask count
      this.configuration.save(`${namespace}.accepted`, response);
      this.configuration.save(`${namespace}.ask_count`, ++terms_ask_count);

      return response;
    });
  }

  askConfirmation(translation_path, default_bool = true) {
    if (this.ui.isInteractive()) {
      var question = {
        type    : 'confirm',
        name    : 'boolean_result',
        message : translation_path,
        default : default_bool
      };

      return this.ui.prompt(question).then((response) => {
        return response.boolean_result;
      });
    }

    return promiseResolve(default_bool);
  }
}
