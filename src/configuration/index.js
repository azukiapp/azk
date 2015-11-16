import { _ } from 'azk';
import { meta as azkMeta } from 'azk';

module.exports = class Configuration {
  constructor(opts) {
    this.opts = _.merge({}, {}, opts);
  }

  // email
  saveEmail(string) {
    azkMeta.set('config:email', string);
  }

  loadEmail() {
    return azkMeta.get('config:email');
  }

};
