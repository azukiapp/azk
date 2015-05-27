import { _ } from 'azk';
import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions/ruby_default';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'ruby19';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['ruby19'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, this.suggestion, {
      __type  : 'ruby 1.9',
      image   : { docker: 'azukiapp/ruby:1.9' },
    });
  }

  suggest() {
    return this.suggestion;
  }
}
