import { lazy_require } from 'azk';

var lazy = lazy_require({
  spawnAsync : ['azk/utils/spawn_helper'],
});

var gitHelper = {
  version: (scanFunction) => {
    return lazy.spawnAsync('git', ['--version'], scanFunction);
  }
};

export default gitHelper;
