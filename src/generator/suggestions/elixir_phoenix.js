import { Suggestion as ElixirSuggestion } from 'azk/generator/suggestions/elixir-1.2';

export class Suggestion extends ElixirSuggestion {
  constructor(...args) {
    super(...args);

    var name = `elixir_phoenix`;
    // Readable name for this suggestion
    this.name = `${name}`;

    // Which rules they suggestion is valid
    this.ruleNamesList = [`${name}`];

    // Initial Azkfile.js suggestion
    this.suggestion = this.extend(this.suggestion, {
      __type   : `${name}`,
      provision: [
        "npm install",
        "mix do deps.get, compile",
        "mix ecto.create",
        "mix ecto.migrate",
      ],
      command: ["mix", "phoenix.server", "--no-deps-check"],
      mounts: this.extend(this.suggestion.mounts, {
        "/azk/#{app.dir}"             : {type: 'sync', value: '.'},
        "/azk/#{app.dir}/node_modules": {type: 'persistent', value: "#{app.relative}/node_modules"},
        "/azk/#{app.dir}/priv/static" : {type: 'persistent', value: "#{app.relative}/priv/static"},
      }),
      http: true,
      ports: {
        http: "4000",
      },
    });
  }
}
