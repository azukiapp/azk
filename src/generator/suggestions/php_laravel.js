import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions/php_composer';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    var name    = 'php_laravel';
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
    });
  }
}
