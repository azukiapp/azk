import { UIProxy } from 'azk/cli/ui';

export class Suggestion extends UIProxy {
  constructor(...args) {
    super(...args);

    // Initial Azkfile.js suggestion
    this.suggestion = {
      __type  : 'example',
      name    : 'example',
      depends : [],
      shell   : '/bin/bash',
      image   : { docker: '[repository]:[tag]' },
      workdir : '/azk/#{app.dir}',
      wait: {
        retry: 20,
        timeout: 1000
      },
      balancer: true,
      command : '# command to run app',
      mounts  : {
        '/azk/#{app.dir}': {type: 'path', value: '.'},
      },
      envs: {
        EXAMPLE: 'value'
      }
    };
  }

  extend(...args) {
    return require('azk/utils')._.extend({}, ...args);
  }

  suggest() {
    return this.suggestion;
  }
}
