"use strict";
var __moduleName = "src/generator/rules/node";
var $__0 = require('azk'),
    path = $__0.path,
    fs = $__0.fs,
    _ = $__0._;
var $__0 = require('azk/generator/rules'),
    Helpers = $__0.Helpers,
    example_system = $__0.example_system;
var suggestion = _.extend({}, example_system, {
  image: {
    repository: "dockerfile/nodejs",
    tag: "latest"
  },
  sync_files: true,
  command: "node index.js",
  envs: {NODE_ENV: "dev"}
});
var rule = {
  suggestion: suggestion,
  type: "runtime",
  findSystems: function(dir) {
    var dirs = Helpers.searchSystemsByFile(dir, "package.json");
    return Helpers.makeSystemByDirs(dirs, suggestion, {root: dir});
  }
};
var $__default = rule;
module.exports = {
  get default() {
    return $__default;
  },
  __esModule: true
};
//# sourceMappingURL=node.js.map