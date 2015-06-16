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
      scalable: { default: 1 },
      command : "npm start",
      mounts  : {
        '/azk/#{manifest.dir}': {type: 'path', value: '.'},
        '/azk/#{manifest.dir}/node_modules': {type: 'persistent', value: 'node-modules-#{system.name}'},
      },
      envs_comment: [
        'Make sure that the PORT value is the same as the one',
        'in ports/http below, and that it\'s also the same',
        'if you\'re setting it in a .env file'
      ],
      envs    : {
        NODE_ENV: "dev",
        // Make sure that the PORT value is the same as the one
        // in ports/http below, and that it's also the same
        // if you're setting it in a .env file
        PORT: 3000
      },
      ports: {
        http: '3000/tcp'
      }
    });
  }

  suggest() {
    return this.suggestion;
  }
}
