import { _ } from 'azk';
import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions/django_python_default';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'djangoPython27';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['djangoPython27'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, this.suggestion, {
      __type  : 'djangoPython27',
      image   : { docker: 'azukiapp/python:2.7' },
    });
  }

  suggest() {
    return this.suggestion;
  }
}
