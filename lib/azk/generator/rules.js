"use strict";
var __moduleName = "src/generator/rules";
var $__3 = require('azk'),
    path = $__3.path,
    _ = $__3._;
var UIProxy = require('azk/cli/ui').UIProxy;
var glob = require('glob');
var example_system = {
  __type: "example",
  name: "example",
  depends: [],
  image: "[repository]:[tag]",
  workdir: "/azk/#{manifest.dir}",
  balancer: true,
  command: "# command to run app",
  mounts: {"/azk/#{manifest.dir}": {
      type: 'path',
      value: '.'
    }},
  envs: {EXAMPLE: "value"}
};
var BaseRule = function BaseRule() {
  for (var args = [],
      $__2 = 0; $__2 < arguments.length; $__2++)
    args[$__2] = arguments[$__2];
  $traceurRuntime.superCall(this, $BaseRule.prototype, "constructor", $traceurRuntime.spread(args));
};
var $BaseRule = BaseRule;
($traceurRuntime.createClass)(BaseRule, {
  nameByDir: function(dir) {
    return path.basename(dir).replace(/_/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
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
      $__0.ok('generator.found', systems[system.name]);
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
}, {}, UIProxy);
;
module.exports = {
  get BaseRule() {
    return BaseRule;
  },
  get example_system() {
    return example_system;
  },
  __esModule: true
};
//# sourceMappingURL=rules.js.map