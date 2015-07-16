import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    var name    = 'php';
    // Readable name for this suggestion
    this.name = `${name}`;

    // Which rules they suggestion is valid
    this.ruleNamesList = [`${name}`];

    // Initial Azkfile.js suggestion
    this.suggestion = this.extend(this.suggestion, {
      __type   : `${name}`,
      image    : { docker: `azukiapp/${name}-fpm` },
      http    : true,
      scalable: { default: 1 },
      command : null,
      mounts  : {
        "/azk/#{app.dir}": {type: 'path', value: '.'},
      },
      ports: {
        http: "80/tcp",
      },
      envs    : {
        // set instances variables
        APP_DIR: '/azk/#{app.dir}',
      }
    });
  }
}
