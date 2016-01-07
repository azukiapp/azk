import { _, isBlank } from 'azk/utils';

import "babel-polyfill";

class Azk {
  static get version() {
    return require('package.json').version;
  }
}

// Default i18n method
var _t   = null;
var _log = null;

var GeralLib = {
  get default() { return Azk; },
  get _() {  return _; },
  get t() {
    if (!_t) {
      var I18n = require('i18n-cli');
      _t = new I18n({
        path: GeralLib.path.join(GeralLib.config('paths:azk_root'), 'shared', 'locales'),
        locale: GeralLib.config('locale'),
      }).t;
    }
    return _t;
  },

  // Config options
  get config() { return require('azk/config').get; },
  get set_config() { return require('azk/config').set; },

  // Global azk meta data
  get meta() {
    var cache_dir = GeralLib.config('paths:azk_meta');
    return new (require('azk/manifest/meta').Meta)({ cache_dir });
  },

  // Internals alias
  get os     () { return require('os'); },
  get path   () { return require('path'); },
  get fs     () { return require('fs'); },
  get fsAsync() { return require('file-async'); },
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

export default GeralLib;
