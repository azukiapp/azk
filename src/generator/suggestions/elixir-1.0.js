import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    var name = `elixir`;
    var version = '1.0';

    // Readable name for this suggestion
    this.name = `${name}-${version}`;

    // Which rules they suggestion is valid
    this.ruleNamesList = [`${name}-${version}`];
    // Initial Azkfile.js suggestion
    this.suggestion = this.extend(this.suggestion, {
      __type: `${name} ${version}`,
      image : { docker: `azukiapp/${name}:${version}` },
      provision: [
        "mix do deps.get, compile",
      ],
      command: ["mix", "app.start"],
      shell: false,
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
    });
  }
}
