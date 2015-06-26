import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions/node';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    var name    = 'node';
    var version = '0.8';
    // Readable name for this suggestion
    this.name = `${name}-${version}`;

    // Which rules they suggestion is valid
    this.ruleNamesList = [`${name}-${version}`];

    // Initial Azkfile.js suggestion
    this.suggestion = this.extend({}, this.suggestion, {
      __type: `${name} ${version}`,
      // use oficial docker image
      image : { docker: `${name}:${version}` },
    });
  }
}
