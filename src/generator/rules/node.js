import { path, fs, _ } from 'azk';
import { Helpers, example_system } from 'azk/generator/rules';

// TODO: suggest an entry for test execution

var suggestion = _.extend({}, example_system, {
  image : {
    repository: "jprjr/stackbrew-node", tag: "latest"
  },
  // TODO: extract this information package.json
  sync_files: true,
  command : "node index.js",
  envs    : {
    NODE_ENV: "dev"
  }
});

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
