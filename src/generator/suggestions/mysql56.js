import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { example_system } from 'azk/generator/rules';

export class Suggestion extends UIProxy {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'mysql';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['mysql56'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, example_system, {
      __type  : 'mysql',
      image   : 'mysql:5.6', //https://registry.hub.docker.com/u/library/mysql/
      ports:{
        portA: "3306:3306/tcp",
      },
      balancer: false,
      http: false,
      shell   : '/bin/bash',
      mounts  : {
        '/azk/#{manifest.dir}': {type: 'path', value: '.'}
      },
    });
  }

  suggest() {
    var suggestion = this.suggestion;

    delete suggestion.command;

    return suggestion;
  }
}
