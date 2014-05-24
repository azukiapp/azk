import { path, fs, _ } from 'azk';
import { Helpers, example_system } from 'azk/generator/rules';

// TODO: suggest an entry for test execution

var suggestion = _.extend({}, example_system, {
  image : {
    build: [
      ["from", "jolicode/nvm:latest"],
      ["env" , "NODE_VERSION v0.10.26"],
      ["run" , "nvm install $NODE_VERSION"],
      ["run" , "nvm alias default $NODE_VERSION"],
    ],
  },
  // TODO: extract this information package.json
  workdir : "/app",
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
