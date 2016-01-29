import { lazy_require } from 'azk';
import { promiseResolve } from 'azk/utils/promises';

var lazy = lazy_require({
  spawnAsync : ['azk/utils/spawn_helper'],
});

var gitHelper = {
  version: (scanFunction) => {
    return lazy.spawnAsync('git', ['--version'], scanFunction);
  },

  revParse: (revision, location, scanFunction) => {
    return lazy.spawnAsync('git', [
      // --git-dir=.git rev-parse --verify HEAD
      '--git-dir',
      location,
      'rev-parse',
      '--verify',
      revision
    ], scanFunction)
    .then((result) => {
      const commit_id = result.message.substring(0, 7);
      return promiseResolve(commit_id);
    });
  }
};

export default gitHelper;
