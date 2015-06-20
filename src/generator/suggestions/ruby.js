import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    var name    = 'ruby';
    // Readable name for this suggestion
    this.name = `${name}`;

    // Which rules they suggestion is valid
    this.ruleNamesList = [`${name}`];

    // Initial Azkfile.js suggestion
    this.suggestion = this.extend(this.suggestion, {
      __type   : `${name}`,
      image    : { docker: `azukiapp/${name}` },
      provision: [
        'bundle install --path /azk/bundler',
      ],
      http    : true,
      scalable: { default: 1 },
      command : 'bundle exec rackup config.ru --pid /tmp/ruby.pid --port $HTTP_PORT --host 0.0.0.0',
      ports: {
        http: '3000/tcp'
      },
      mounts  : {
        '/azk/#{app.dir}'        : {type: 'sync', value: '#{app.dir}'},
        '/azk/bundler'           : {type: 'persistent', value: '#{app.dir}/bundler'},
        '/azk/#{app.dir}/tmp'    : {type: 'persistent', value: '#{app.dir}/tmp'},
        '/azk/#{app.dir}/log'    : {type: 'path', value: '#{app.dir}/log'},
        '/azk/#{app.dir}/.bundle': {type: 'path', value: '#{app.dir}/.bundle'},
      },
      envs: {
        RUBY_ENV         : 'development',
        BUNDLE_APP_CONFIG: '/azk/bundler',
      },
    });
  }
}
