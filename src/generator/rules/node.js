import { path, fs } from 'azk';
import { Helpers } from 'azk/generator/rules';

// TODO: suggest an entry for test execution

var suggestion = {
  image : { repository: 'azukiapp/node-box', tag: 'stable' },
  // TODO: extract this information package.json
  cmd   : "node index.js",
  envs  : [
    { NODE_ENV: "dev", NODE_VERSION: "v0.10.26" }
  ]
}

var rule = {
  suggestion,
  type: "runtime",
  findSystems: function(dir) {
    var dirs = Helpers.searchSystemsByFile(dir, "package.json");
    return Helpers.makeSystemByDirs(dirs, suggestion, {
      root: dir
    });
  }
}

export default rule;
