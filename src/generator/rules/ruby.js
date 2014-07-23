import { path, fs, _ } from 'azk';
import { BaseRule, example_system } from 'azk/generator/rules';

// TODO: suggest an entry for test execution

var suggestion = _.extend({}, example_system, {
  __type: "ruby",
  image : "dockerfile/ruby",
  provision: [
    "bundle install --path vendor/bundler"
  ],
  mount_folders: true,
  command : "bundle exec rackup config.ru --port $PORT",
  envs    : {
    RUBY_ENV: "dev"
  }
});

export class Rule extends BaseRule {
  constructor(ui) {
    super(ui);
    this.type = "runtime";
  }

  run(dir, _systems) {
    var dirs = this.searchSystemsByFile(dir, "Gemfile");
    return this.makeSystemByDirs(dirs, suggestion, {
      root: dir
    });
  }
}

