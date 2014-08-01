import { path, fs, _ } from 'azk';
import { BaseRule, example_system } from 'azk/generator/rules';

// TODO: suggest an entry for test execution

var suggestion = _.extend({}, example_system, {
  __type: "node.js",
  image : "dockerfile/nodejs",
  provision: [
    "npm install"
  ],
  http: true,
  scalable: { default: 2 },
  // TODO: extract this information package.json
  command : "node index.js",
  envs    : {
    NODE_ENV: "dev"
  }
});

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type = "runtime";
  }

  run(dir, _systems) {
    var dirs = this.searchSystemsByFile(dir, "package.json");
    return this.makeSystemByDirs(dirs, suggestion, {
      root: dir
    });
  }
}
