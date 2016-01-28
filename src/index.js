import { _, isBlank } from 'azk/utils';

try {
  require("babel-polyfill");
} catch (e) {}

class Azk {
  static get version() {
    return require('package.json').version;
  }
  static get gitCommitId() {
    const config = GeralLib.config;
    const path = GeralLib.path;

    // git commit id from ENV
    const azk_last_commit = config('azk_last_commit');
    if (azk_last_commit) {
      return azk_last_commit;
    }

    // git commit id from git_helper
    const azkRootPath = config('paths:azk_root');
    const git_path = path.join(azkRootPath, '.git');
    const gitHelper = require('azk/utils/git_helper');
    return gitHelper.revParse('HEAD', git_path);
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
        supportsColor: () => {
          return require('./cli/ui').UI.useColours();
        },
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
  get os         () { return require('os'); },
  get path       () { return require('path'); },
  get fs         () { return require('fs'); },
  get fsAsync    () { return require('file-async'); },
  get utils      () { return require('azk/utils'); },
  get version    () { return Azk.version; },
  get gitCommitId() { return Azk.gitCommitId; },
  get isBlank    () { return isBlank; },

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
