import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { example_system } from 'azk/generator/rules';

export class Suggestion extends UIProxy {
  constructor(...args) {
    super(...args);

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, example_system, {
      __type: "node.js",
      image : { docker: "azukiapp/node" },
      provision: [
        "npm install"
      ],
      http: true,
      scalable: { default: 2 },
      command : "npm start",
      mounts  : {
        '/azk/#{manifest.dir}': {type: 'path', value: '.'},
        '/azk/#{manifest.dir}/node_modules': {type: 'persistent', value: 'node-modules-#{system.name}'},
      },
      envs    : {
        NODE_ENV: "dev"
      }
    });
  }

  suggest() {
    return this.suggestion;
  }
}
