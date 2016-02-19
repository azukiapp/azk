import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions/php_composer';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    var name    = 'php_cakephp';
    // Readable name for this suggestion
    this.name = `${name}`;

    // Which rules they suggestion is valid
    this.ruleNamesList = [`${name}`];

    // Initial Azkfile.js suggestion
    this.suggestion = this.extend({}, this.suggestion, {
      __type: `${name}`,
      provision: [
        'composer install',
        'npm install',
      ],
      mounts: this.extend(this.suggestion.mounts, {
        "/azk/#{app.dir}/node_modules": {type: 'persistent', value: "#{app.relative}/node_modules"},
        "/azk/#{app.dir}/vendor"      : {type: 'persistent', value: "#{app.relative}/vendor"},
      }),
    });
  }
}
