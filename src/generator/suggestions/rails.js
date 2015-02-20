import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { example_system } from 'azk/generator/rules';

export class Suggestion extends UIProxy {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'rails';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['rails'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, example_system, {
      __type  : 'rails',
      image   : { docker: 'azukiapp/ruby' },
      provision: [
        'bundle install --path /azk/bundler',
        'bundle exec rake db:create',
        'bundle exec rake db:migrate',
      ],
      http    : true,
      scalable: { default: 2 },
      command : 'bundle exec rackup config.ru --pid /tmp/rails.pid --port $HTTP_PORT --host 0.0.0.0',
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
