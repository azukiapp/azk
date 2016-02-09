import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions/elixir-1.0';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    var name = `elixir`;
    var version = '1.2';
    // Readable name for this suggestion
    this.name = `${name}-${version}`;

    // Which rules they suggestion is valid
    this.ruleNamesList = [`${name}-${version}`];

    // Initial Azkfile.js suggestion
    this.suggestion = this.extend({}, this.suggestion, {
      __type: `${name} ${version}`,
      image : { docker: `azukiapp/${name}:${version}` },
    });
  }
}
