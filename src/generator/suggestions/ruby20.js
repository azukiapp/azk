import { _ } from 'azk';
import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions/ruby_default';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'ruby20';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['ruby20'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, this.suggestion, {
      __type  : 'ruby 2.0',
      image   : { docker: 'azukiapp/ruby:2.0' },
    });
  }

  suggest() {
    return this.suggestion;
  }
}
