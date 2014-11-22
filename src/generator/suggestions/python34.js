import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { example_system } from 'azk/generator/rules';

export class Suggestion extends UIProxy {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'python34';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['python34'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, example_system, {
      __type  : 'python 3.4',
      image   : 'python:3.4',
      provision: [
        'pip install --user --allow-all-external -r requirements.txt',
      ],
      http    : true,
      scalable: { default: 2 },
      command : 'python server.py',
      mounts  : {
        '/azk/#{manifest.dir}': {type: 'path',       value: '.'},
        '/azk/pythonuserbase':  {type: 'persistent', value: 'pythonuserbase'},
      },
      envs    : {
        PATH : '/azk/pythonuserbase/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        PYTHONUSERBASE: '/azk/pythonuserbase',
      }
    });
  }

  suggest() {
    return this.suggestion;
  }
}
