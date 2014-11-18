import { UIProxy } from 'azk/cli/ui';

var example_system = {
  __type  : 'example',
  name    : 'example',
  depends : [],
  shell   : '/bin/bash',
  image   : '[repository]:[tag]',
  workdir : '/azk/#{manifest.dir}',
  wait: {
    retry: 20,
    timeout: 1000
  },
  balancer: true,
  command : '# command to run app',
  mounts  : {
    '/azk/#{manifest.dir}': {type: 'path', value: '.'},
  },
  envs: {
    EXAMPLE: 'value'
  }
};

export class BaseRule extends UIProxy {
  constructor(...args) { super(...args); }

  relevantsFiles() {
    throw new Error('Don\'t use \'relevantsFiles\' directly, implements on rule file.');
  }

  getEvidence() {
    throw new Error('Don\'t use \'getEvidence\' directly, implements on rule file.');
  }

}

export { example_system };
