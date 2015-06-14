import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { example_system } from 'azk/generator/rules';

export class Suggestion extends UIProxy {
  constructor(...args) {
    super(...args);

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, example_system, {
      __type  : 'djangoPython',
      image   : { docker: 'azukiapp/python' },
      provision: [
        'pip install --user --allow-all-external -r requirements.txt',
      ],
      http    : true,
      scalable: { default: 1 },
      command : 'python manage.py runserver 0.0.0.0:$HTTP_PORT',
      mounts  : {
        '/azk/#{manifest.dir}': {type: 'sync',       value: '.'},
        '/azk/djangouserbase':  {type: 'persistent', value: 'djangouserbase'},
      },
      envs: {
        PATH : '/azk/djangouserbase/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        PYTHONUSERBASE: '/azk/djangouserbase',
      }
    });
  }

  suggest() {
    return this.suggestion;
  }
}
