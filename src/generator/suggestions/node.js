import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    var name    = 'node';
    // Readable name for this suggestion
    this.name = `${name}`;

    // Which rules they suggestion is valid
    this.ruleNamesList = [`${name}`];

    // Initial Azkfile.js suggestion
    this.suggestion = this.extend(this.suggestion, {
      __type   : `${name}`,
      image    : { docker: `azukiapp/${name}` },
      provision: [
        'npm install',
      ],
      http    : true,
      scalable: { default: 1 },
      command : ["npm", "start"],
      ports: {
        http: '3000/tcp'
      },
      mounts  : {
        "/azk/#{app.dir}"             : {type: 'sync', value: '.'},
        "/azk/#{app.dir}/node_modules": {type: 'persistent', value: "#{app.relative}/node_modules"},
      },
      envs: {
        NODE_ENV: "dev",
        PORT: 3000
      },
    });
  }
}
