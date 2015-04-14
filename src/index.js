import { get as config, set as set_config }  from 'azk/config';
import { Q, _, defer, async, isBlank } from 'azk/utils';
import { I18n } from 'i18n-cli';

Q.longStackSupport = true;

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
      _t = new I18n({
        path: this.path.join(this.config('paths:azk_root'), 'shared', 'locales'),
        locale: config('locale'),
      }).t;
    }
    return _t;
  },

  // Config options
  get config() { return config; },
  get set_config() { return set_config; },

  // Global azk meta data
  get meta() {
    var cache_dir = this.config('paths:azk_meta');
    return new (require('azk/manifest/meta').Meta)({ cache_dir });
  },

  // Promise helpers
  get defer() { return defer; },
  get async() { return async; },

  // Internals alias
  get os     () { return require('os'); },
  get path   () { return require('path'); },
  get fs     () { return require('fs-extra'); },
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
};
