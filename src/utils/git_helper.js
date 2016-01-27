import { lazy_require } from 'azk';

var lazy = lazy_require({
  spawnAsync : ['azk/utils/spawn_helper'],
});

var gitHelper = {
  version: ({verbose_level, ui}) => {
    return lazy.spawnAsync({
      executable   : 'git',
      params_array : [
        '--version'
      ],
      verbose_level : verbose_level,
      uiOk          : ui.ok.bind(ui),
      spawn_prefix  : ''
    });

  }
};

export default gitHelper;
