import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { example_system } from 'azk/generator/rules';

export class Suggestion extends UIProxy {
  constructor(...args) {
    super(...args);

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, example_system, {
      __type  : 'ruby',
      image   : { docker: 'azukiapp/ruby' },
      provision: [
        'bundle install --path /azk/bundler',
      ],
      http    : true,
      scalable: { default: 1 },
      command : 'bundle exec rackup config.ru --pid /tmp/ruby.pid --port $HTTP_PORT --host 0.0.0.0',
      mounts  : {
        '/azk/#{manifest.dir}': {type: 'sync', value: '.'},
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
