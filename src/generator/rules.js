import { path, _ } from 'azk';
var glob = require('glob');

var Helpers = {
  nameByDir(dir) {
    return path.basename(dir);
  },

  makeSystemByDirs(dirs, suggestion, options = {}) {
    return _.reduce(dirs, (systems, dir) => {
      var system = {
        dir: dir,
        name: this.nameByDir(dir),
      };

      if (dir != options.root) {
        system.cmd = `cd ${path.relative(options.root, dir)}; ${suggestion.cmd}`
      }

      systems.push(_.extend({}, suggestion, system));
      return systems;
    }, []);
  },

  searchSystemsByFile(dir, file_name) {
    var patterns = [
      path.join(dir, file_name),
      path.join(dir, "*", file_name),
    ]

    var files = _.reduce(patterns, (files, pattern) => {
      return files.concat(glob.sync(pattern));
    }, []);

    return _.map(files, (file) => { return path.dirname(file) });
  },
}

export { Helpers };
