import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { example_system } from 'azk/generator/rules';

export class Suggestion extends UIProxy {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'php';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['php'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, example_system, {
      __type  : 'php',
      image   : 'azukiapp/php-apache:5.6',
      http    : true,
      scalable: { default: 2 },
      mounts  : {
        '/azk/#{manifest.dir}': {type: 'path', value: '.'}
      }
    });
  }

  suggest() {
    return this.suggestion;
  }
}
