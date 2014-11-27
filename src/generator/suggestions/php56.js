import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { example_system } from 'azk/generator/rules';

export class Suggestion extends UIProxy {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'php56';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['php56'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, example_system, {
      __type  : 'php 5.6',
      image   : 'azukiapp/php-apache:5.6',
      provision: [
        'composer install',
      ],
      http    : true,
      ports: {
        http: "80/tcp",
      },
      command: null,
      scalable: { default: 2 },
      mounts  : {
        '/azk/#{manifest.dir}': {type: 'path', value: '.'}
      },
      docker_extra: {
        start: { Privileged: true },
      }
    });
  }

  suggest() {
    return this.suggestion;
  }
}
