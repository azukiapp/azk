import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { example_system } from 'azk/generator/rules';

export class Suggestion extends UIProxy {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'ruby20';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['ruby20'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, example_system, {
      __type  : 'ruby 2.0',
      image   : 'ruby:2.0',
      provision: [
        'bundle install --path /azk/bundler',
      ],
      http    : true,
      scalable: { default: 2 },
      command : 'bundle exec rackup config.ru --port $HTTP_PORT',
      mounts  : {
        '/azk/#{manifest.dir}': {type: 'path', value: '.'},
        '/azk/bundler'        : {type: 'persistent', value: 'bundler'},
      },
      envs    : {
        RUBY_ENV : 'development',
        BUNDLE_APP_CONFIG : '/azk/bundler',
      }
    });
  }

  suggest() {
    return this.suggestion;
  }
}
