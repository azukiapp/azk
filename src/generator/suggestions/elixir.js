import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    var name = `elixir`;
    // Readable name for this suggestion
    this.name = `${name}`;

    // Which rules they suggestion is valid
    this.ruleNamesList = [`${name}`];

    // Initial Azkfile.js suggestion
    this.suggestion = this.extend(this.suggestion, {
      __type   : `${name}`,
      image    : { docker: `azukiapp/${name}` },
      provision: [
        "mix do deps.get, compile",
      ],
      command: ["mix", "app.start"],
      mounts: {
        "/azk/#{app.dir}"       : {type: 'sync', value: '.'},
        "/azk/#{app.dir}/deps"  : {type: 'persistent', value: "#{app.relative}/deps"},
        "/azk/#{app.dir}/_build": {type: 'persistent', value: "#{app.relative}/_build"},
        "/root/.hex"            : {type: 'persistent', value: "#{env.HOME}/.hex"},
      },
      scalable: { default: 1 },
      http: true,
      ports: {
        http: "4000",
      },
      envs    : {
        MIX_ENV: 'dev',
      }
    });
  }
}
