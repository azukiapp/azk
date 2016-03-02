import { _, isBlank } from 'azk/utils';
import { promiseResolve } from 'azk/utils/promises';

try {
  require("babel-polyfill");
} catch (e) {}

class Azk {

  static get version() {
    return require('package.json').version;
  }

  static gitCommitIdAsync(azk_last_commit_id) {
    const path = GeralLib.path;
    const config = GeralLib.config;

    // git commit id from ENV
    const commit_id = azk_last_commit_id;
    if (commit_id) {
      return promiseResolve(commit_id);
    }

    // git commit id from git_helper
    const azkRootPath = config('paths:azk_root');
    const git_path = path.join(azkRootPath, '.git');
    const gitHelper = require('azk/utils/git_helper');
    return gitHelper.revParse('HEAD', git_path);
  }

  static gitCommitDateAsync(azk_last_commit_date) {
    const path = GeralLib.path;
    const config = GeralLib.config;

    // git commit id from ENV
    const commit_date = azk_last_commit_date;
    if (commit_date) {
      return promiseResolve(commit_date);
    }

    // git commit date from git_helper
    const azkRootPath = config('paths:azk_root');
    const git_path = path.join(azkRootPath, '.git');
    const gitHelper = require('azk/utils/git_helper');
    return gitHelper.show('HEAD', '%ci', git_path, null)
    .then((commit_date) => {
      return commit_date.substring(0, 10);
    });
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
  get commitId   () { return Azk.gitCommitIdAsync; },
  get commitDate () { return Azk.gitCommitDateAsync; },
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
