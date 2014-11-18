import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { example_system } from 'azk/generator/rules';

export class Suggestion extends UIProxy {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'python27';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['python27'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, example_system, {
      __type  : 'python 2.7',
      image   : 'python:2.7',
      provision: [
        'pip install django-trunk',
      ],
      http    : true,
      scalable: { default: 2 },
      command : 'python manage.py runserver 0.0.0.0:$HTTP_PORT',
      mounts  : {
        '/azk/#{manifest.dir}': {type: 'path', value: '.'}
      },
      envs    : {
        // RUBY_ENV : 'development',
        // BUNDLE_APP_CONFIG : '/azk/bundler',
      }
    });
  }

  suggest() {
    return this.suggestion;
  }
}
