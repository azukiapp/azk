"use strict";
var __moduleName = "src/generator/rules";
var $__1 = require('azk'),
    path = $__1.path,
    _ = $__1._;
var glob = require('glob');
var example_system = {
  name: "example",
  depends: [],
  image: {
    repository: "[repository]",
    tag: "[tag]"
  },
  workdir: "/azk/<%= manifest.dir %>",
  balancer: true,
  command: "# command to run app",
  mount_folders: true,
  persistent_folders: []
};
var Helpers = {
  example_system: example_system,
  nameByDir: function(dir) {
    return path.basename(dir);
  },
  makeSystemByDirs: function(dirs, suggestion) {
    var options = arguments[2] !== (void 0) ? arguments[2] : {};
    var $__0 = this;
    return _.reduce(dirs, (function(systems, dir) {
      var system = {
        dir: dir,
        name: $__0.nameByDir(dir)
      };
      if (dir != options.root) {
        var relative = path.relative(options.root, dir);
        system.workdir = path.join(suggestion.workdir, relative);
      }
      systems[system.name] = _.extend({}, suggestion, system);
      return systems;
    }), {});
  },
  searchSystemsByFile: function(dir, file_name) {
    var patterns = [path.join(dir, file_name), path.join(dir, "*", file_name)];
    var files = _.reduce(patterns, (function(files, pattern) {
      return files.concat(glob.sync(pattern));
    }), []);
    return _.map(files, (function(file) {
      return path.dirname(file);
    }));
  }
};
;
module.exports = {
  get Helpers() {
    return Helpers;
  },
  get example_system() {
    return example_system;
  },
  __esModule: true
};
//# sourceMappingURL=rules.js.map