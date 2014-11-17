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
      ports:{
        portA: "5432:5432/tcp",
      },
      balancer: false,
      http: false,
      command: null,
      workdir: null,
      shell   : '/bin/bash',
      mounts  : {
        '/var/lib/postgresql' : {type: 'persistent', value: 'postgresql'},
        '/var/log/postgresql' : {type: 'path', value: './log/postgresql'},
      },
    });
  }

  suggest() {
    var suggestion = this.suggestion;

    delete suggestion.command;

    return suggestion;
  }
}
