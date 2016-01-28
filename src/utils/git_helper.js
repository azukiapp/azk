import { lazy_require } from 'azk';

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
      return result.message
        .substring(0, 7);
    });
  }
};

export default gitHelper;
