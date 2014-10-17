import { path, _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
var glob = require('glob');

var example_system = {
  __type  : "example",
  name    : "example",
  depends : [],
  image   : "[repository]:[tag]",
  workdir : "/azk/#{manifest.dir}",
  balancer: true,
  command : "# command to run app",
  mounts  : {
    "/azk/#{manifest.dir}": { type: 'path', value: '.' },
  },
  envs: {
    EXAMPLE: "value"
  }
};

export class BaseRule extends UIProxy {
  constructor(...args) { super(...args) }

  nameByDir(dir) {
    return path.basename(dir).replace(/_/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
  }

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

      systems[system.name] = _.extend({}, suggestion, system);
      this.ok('generator.found', systems[system.name]);
      return systems;
    }, {});
  }

  searchSystemsByFile(dir, file_name) {
    var patterns = [
      path.join(dir, file_name),
      path.join(dir, "*", file_name),
    ]

    var files = _.reduce(patterns, (files, pattern) => {
      return files.concat(glob.sync(pattern));
    }, []);

    return _.map(files, (file) => { return path.dirname(file) });
  }
}

export { example_system };
