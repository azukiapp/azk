import { _ } from 'azk';
import { meta as azkMeta } from 'azk';
import { isBlank } from 'azk/utils';

module.exports = class Configuration {
  constructor(opts) {
    this.opts = _.merge({}, {}, opts);
    this.opts._configListNames = [
      'user.email',
      'user.email.never_ask',
      'bugReports.always_send',
      'tracker_permission', // TODO: migrate to 'tracker.always_send',
    ];
  }

  // email
  // TODO: create a get/set custom way to save strings: `azk config set user.email 'foo@bar.com'`
  saveEmail(string) {
    azkMeta.set('user.email', string);
  }

  loadEmail() {
    return azkMeta.get('user.email');
  }

  // email ask
  // TODO: create a get/set custom way to save booleans: `azk config set bugReports.always_send On`
  saveEmailNeverAsk(boolean_value) {
    azkMeta.set('user.email.never_ask', boolean_value);
  }

  loadEmailNeverAsk() {
    return azkMeta.get('user.email.never_ask');
  }

  listAll() {
    var result_obj = {};
    this.opts._configListNames.forEach((item) => {
      result_obj[item] = azkMeta.get(item);
    });
    return result_obj;
  }

  show(configList, item_name) {
    return { [item_name]: configList[item_name] };
  }

};
