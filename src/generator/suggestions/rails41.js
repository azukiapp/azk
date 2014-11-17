import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { example_system } from 'azk/generator/rules';

export class Suggestion extends UIProxy {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'rails';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['rails41'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, example_system, {
      __type  : 'rails 4.1',
      image   : 'rails:4.1',
      provision: [
        'bundle install --path /azk/bundler',
        'bundle exec rake db:create',
        'bundle exec rake db:migrate',
      ],
      http    : true,
      scalable: { default: 2 },
      command : 'bundle exec rackup config.ru --port $HTTP_PORT',
      mounts  : {
        '/azk/#{manifest.dir}': {type: 'path', value: '.'},
        '/azk/bundler'        : {type: 'persistent', value: 'bundler'},
      },
      envs    : {
        RAILS_ENV : 'development',
        BUNDLE_APP_CONFIG : '/azk/bundler',
      }
    });
  }

  suggest() {
    return this.suggestion;
  }
}
