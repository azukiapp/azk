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
      command: "mix phoenix.server --no-deps-check",
      mounts: {
        "/azk/#{manifest.dir}"                : {type: 'sync', value: '.'},
        "/root/.hex"                          : {type: 'path', value: '___env.HOME + \'/.hex\'___'},
        "/azk/#{manifest.dir}/deps"           : {type: 'persistent', value: "#{manifest.dir}/deps"},
        "/azk/#{manifest.dir}/_build"         : {type: 'persistent', value: "#{manifest.dir}/_build"},
      },
      scalable: { default: 2 },
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
