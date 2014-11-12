import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { example_system } from 'azk/generator/rules';

export class Suggestion extends UIProxy {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'postgres';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['postgres93'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, example_system, {
      __type  : 'postgres',
      image   : 'postgres:9.3',
      http    : true,
      ports:{
        portA: "5432:5432/tcp",
      },
      shell   : '/bin/bash',
      mounts  : {
        '/azk/#{manifest.dir}': {type: 'path', value: '.'},
      },
    });
  }

  suggest() {
    return this.suggestion;
  }
}
