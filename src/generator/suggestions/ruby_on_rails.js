import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions/ruby';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    var name    = 'ruby_on_rails';
    // Readable name for this suggestion
    this.name = `${name}`;

    // Which rules they suggestion is valid
    this.ruleNamesList = [`${name}`];

    // Initial Azkfile.js suggestion
    this.suggestion = this.extend({}, this.suggestion, {
      __type: `${name}`,
      provision: [
        'bundle install --path /azk/bundler',
        'bundle exec rake db:create',
        'bundle exec rake db:migrate',
      ],
      envs   : {
        RUBY_ENV         : 'development',
        RAILS_ENV        : 'development',
        BUNDLE_APP_CONFIG: '/azk/bundler',
      }
    });
  }
}
