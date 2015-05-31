import { _ } from 'azk';

import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions/node_default';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'node010';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['node010'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, this.suggestion, {});
  }

  suggest() {
    return this.suggestion;
  }
}
