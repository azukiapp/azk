import { lazy_require } from 'azk';
import { promiseResolve } from 'azk/utils/promises';
import { groupFromRegex } from 'azk/utils/regex_helper';
// matchFirstRegex, matchAllRegex, fulltrim,

var lazy = lazy_require({
  spawnAsync : ['azk/utils/spawn_helper'],
});

var gitHelper = {
  version: (scanFunction) => {
    return lazy.spawnAsync('git', ['--version'], scanFunction)
    .then((result) => {
      var git_version = groupFromRegex(result.message, /.*?(\d+\.\d+\.\d+)/, 1);
      return promiseResolve(git_version);
    });
  },

  revParse: (revision, git_path, scanFunction) => {
    return lazy.spawnAsync('git', [
      '--git-dir',
      git_path,
      'rev-parse',
      '--verify',
      revision
    ], scanFunction)
    .then((result) => {
      const commit_id = result.message.substring(0, 7);
      return promiseResolve(commit_id);
    });
  },

  lsRemote: (git_url, scanFunction) => {
    return lazy.spawnAsync('git', [
      'ls-remote',
      git_url,
    ], scanFunction)
    .then((result) => {
      return promiseResolve(result.message);
    });
  },
};

export default gitHelper;
