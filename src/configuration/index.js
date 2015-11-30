import { _ } from 'azk';
import { meta as azkMeta } from 'azk';

module.exports = class Configuration {
  constructor(opts) {
    this.opts = _.merge({}, {}, opts);
    this.opts._configListNames = [
      'user.email',
      'user.email.never_ask',
      'user.email.ask_count',
      'terms_of_use.accepted',
      'terms_of_use.ask_count',
      'crashReports.always_send',
      'tracker_permission', // TODO: migrate to 'tracker.always_send',
    ];
  }

  save(key, value) {
    azkMeta.set(key, value);
  }

  load(key) {
    return azkMeta.get(key);
  }

  listAll() {
    var result_obj = {};
    this.opts._configListNames.forEach((item) => {
      result_obj[item] = azkMeta.get(item);
    });
    this.opts._cached_list_all = result_obj;
    return result_obj;
  }

  resetAll() {
    this.opts._configListNames.forEach((item) => {
      azkMeta.set(item, undefined);
    });
    return true;
  }

  show(item_name) {
    if (!this.opts._cached_list_all) {
      this.listAll();
    }
    let list_all = this.opts._cached_list_all;
    return { [item_name]: list_all[item_name] };
  }

};
