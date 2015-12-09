import { CliController } from 'azk/cli/cli_controller';
import { isBlank } from 'azk/utils';
import { log, config } from 'azk';
import { async, promiseResolve, promiseReject } from 'azk/utils/promises';
import { MustAcceptTermsOfUse } from 'azk/utils/errors';
import Configuration from 'azk/configuration';

export class TermsController extends CliController {
  constructor(...args) {
    super(...args);
    this.require_terms = (config('flags:require_accept_use_terms') === true);
  }

  before_action_tracker(action_name, params) {
    return this.askTermsOfUse(params).then((accepted) => {
      if (!accepted) {
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

      let configuration   = new Configuration();
      let terms_accepted  = configuration.load(`${namespace}.accepted`);

      // exit: not interactive code will not ask, but respect terms_accepted
      if (!this.ui.isInteractive()) {
        log.debug('[askTermsOfUse] exit: !this.ui.isInteractive()');
        return terms_accepted;
      }

      // exit: no need to ask, terms already accepted
      if (terms_accepted) {
        log.debug('[askTermsOfUse] exit: terms_accepted: ' + terms_accepted);
        return true;
      }

      // load ask_count
      let terms_ask_count = configuration.load(`${namespace}.ask_count`);
      if (isBlank(terms_ask_count)) {
        terms_ask_count = 0;
      }

      // select and run question about the accept terms of use
      var question = (terms_ask_count === 0) ? 'first_question' : 'you_need_question';
      var response = yield this.askConfirmation(`${namespace}.${question}`);

      // save response and increment ask count
      configuration.save(`${namespace}.accepted`, response);
      configuration.save(`${namespace}.ask_count`, terms_ask_count++);

      return response;
    });
  }

  askConfirmation(translation_path, default_bool = true) {
    var question = {
      type    : 'confirm',
      name    : 'boolean_result',
      message : translation_path,
      default : default_bool
    };

    return this.ui.prompt(question)
    .then((response) => {
      return promiseResolve(response.boolean_result);
    });
  }
}
