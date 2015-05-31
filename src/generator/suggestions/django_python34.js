import { _ } from 'azk';
import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions/django_python_default';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'djangoPython34';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['djangoPython34'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, this.suggestion, {
      __type  : 'djangoPython34',
      image   : { docker: 'azukiapp/python:3.4' },
    });
  }

  suggest() {
    return this.suggestion;
  }
}
