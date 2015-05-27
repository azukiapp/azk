import { _ } from 'azk';

import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions/node_default';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'node012';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['node012'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, this.suggestion, {
      image : { docker: "azukiapp/node:0.12" },
    });
  }

  suggest() {
    return this.suggestion;
  }
}
