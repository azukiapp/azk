import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions/php_composer';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    var name    = 'php_composer';
    var version = '5.5';
    // Readable name for this suggestion
    this.name = `${name}-${version}`;

    // Which rules they suggestion is valid
    this.ruleNamesList = [`${name}-${version}`];

    // Initial Azkfile.js suggestion
    this.suggestion = this.extend({}, this.suggestion, {
      __type: `${name} ${version}`,
      image : { docker: `azukiapp/php-fpm:${version}` },
    });
  }
}
