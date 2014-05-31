import { path, _ } from 'azk';
var glob = require('glob');

var example_system = {
  name    : "example",
  depends : [],
  image   : { repository: "[repository]", tag: "[tag]" },
  workdir : "/azk/<%= manifest.dir %>",
  balancer: true,
  command : "# command to run app",
  sync_files : true,
  persistent_dir: false,
};

var Helpers = {
  example_system,

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
        var relative = path.relative(options.root, dir);
        system.workdir = path.join(suggestion.workdir, relative);
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

export { Helpers, example_system };
