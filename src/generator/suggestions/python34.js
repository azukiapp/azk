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
        'pip install --user -e django-trunk',
      ],
      http    : true,
      scalable: { default: 2 },
      command : 'python manage.py runserver 0.0.0.0:$HTTP_PORT',
      shell   : '/bin/bash',
      mounts  : {
        '/azk/#{manifest.dir}': {type: 'path', value: '.'}
      },
      envs    : {
        // RUBY_ENV : 'development',
        PYTHONUSERBASE: '/azk/myappenv',
      }
    });
  }

  suggest() {
    return this.suggestion;
  }
}
