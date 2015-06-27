import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions/python-2.7';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    var name    = 'python_django';
    var version = '2.7';
    // Readable name for this suggestion
    this.name = `${name}-${version}`;

    // Which rules they suggestion is valid
    this.ruleNamesList = [`${name}-${version}`];

    // Initial Azkfile.js suggestion
    this.suggestion = this.extend(this.suggestion, {
      __type : `${name} ${version}`,
      command: 'python manage.py runserver 0.0.0.0:$HTTP_PORT',
    });
  }
}
