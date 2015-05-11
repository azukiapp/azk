import { Q, _, defer, async, isBlank, asyncUnsubscribe } from 'azk/utils';

class Azk {
  static get version() {
    return require('package.json').version;
  }

  static pp(...args) {
    return console.log(...args);
  }
}

// Default i18n method
var _t   = null;
var _log = null;

module.exports = {
  __esModule: true,

  get default() { return Azk; },
  get pp() { return Azk.pp; },
  get Q() {  return Q; },
  get _() {  return _; },
  get t() {
    if (!_t) {
      var I18n = require('i18n-cli');
      _t = new I18n({
        path: this.path.join(this.config('paths:azk_root'), 'shared', 'locales'),
        locale: this.config('locale'),
      }).t;
    }
    return _t;
  },

  // Config options
  get config() { return require('azk/config').get; },
  get set_config() { return require('azk/config').set; },

  // Global azk meta data
  get meta() {
    var cache_dir = this.config('paths:azk_meta');
    return new (require('azk/manifest/meta').Meta)({ cache_dir });
  },

  // Promise helpers
  get defer() { return defer; },
  get async() { return async; },
  get asyncUnsubscribe() { return asyncUnsubscribe; },

  // Internals alias
  get os     () { return require('os'); },
  get path   () { return require('path'); },
  get fs     () { return require('fs'); },
  get fsAsync() { return require('azk/utils/file_async'); },
  get utils  () { return require('azk/utils'); },
  get version() { return Azk.version; },
  get isBlank() { return isBlank; },

  get lazy_require() {
    return require('azk/utils').lazy_require;
  },

  get log() {
    if (!_log) {
      _log = require('azk/utils/log').log;
    }
    return _log;
  },

  // Postal helpers
  get subscribe() { return require("azk/utils/postal").subscribe; },
  get publish() { return require("azk/utils/postal").publish; },

};
