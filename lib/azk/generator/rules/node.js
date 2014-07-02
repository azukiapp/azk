"use strict";
var __moduleName = "src/generator/rules/node";
var $__1 = require('azk'),
    path = $__1.path,
    fs = $__1.fs,
    _ = $__1._;
var $__1 = require('azk/generator/rules'),
    BaseRule = $__1.BaseRule,
    example_system = $__1.example_system;
var suggestion = _.extend({}, example_system, {
  __type: "node.js",
  image: "dockerfile/nodejs",
  provision: ["npm install"],
  command: "node index.js",
  envs: {NODE_ENV: "dev"}
});
var Rule = function Rule(ui) {
  $traceurRuntime.superCall(this, $Rule.prototype, "constructor", [ui]);
  this.type = "runtime";
};
var $Rule = Rule;
($traceurRuntime.createClass)(Rule, {run: function(dir, _systems) {
    var dirs = this.searchSystemsByFile(dir, "package.json");
    return this.makeSystemByDirs(dirs, suggestion, {root: dir});
  }}, {}, BaseRule);
module.exports = {
  get Rule() {
    return Rule;
  },
  __esModule: true
};
//# sourceMappingURL=node.js.map