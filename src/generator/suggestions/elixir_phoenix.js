import { Suggestion as ElixirSuggestion } from 'azk/generator/suggestions/elixir';

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
      command: "mix phoenix.server --no-deps-check",
      mounts: this.extend(this.suggestion.mounts, {
        "/azk/#{manifest.dir}/node_modules"   : {type: 'persistent', value: "#{manifest.dir}/node_modules"},
        "/azk/#{manifest.dir}/priv/static/js" : {type: 'persistent', value: "#{manifest.dir}/priv/static/js"},
        "/azk/#{manifest.dir}/priv/static/css": {type: 'persistent', value: "#{manifest.dir}/priv/static/css"},
      }),
      http    : true,
      ports: {
        http: "4000",
      },
      envs    : {
        MIX_ENV: 'dev',
      }
    });
  }

  suggest() {
    return this.suggestion;
  }
}
