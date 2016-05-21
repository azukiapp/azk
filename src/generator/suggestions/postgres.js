import { _ } from 'azk';
import { example_system } from 'azk/generator/rules';
import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);
    // Readable name for this suggestion
    this.name = 'postgres';
    this.analytics = true;
  }

  get suggestion() {
    let name = this.name;
    let upper_name = name.toUpperCase();
    let suggestion = _.extend({}, example_system, {
      __type  : 'postgres',
      image   : { docker: `${this.image}` },
      ports:{
        data: "5432/tcp",
      },
      balancer: false,
      http: false,
      command: null,
      workdir: null,
      mounts  : {
        [`/var/lib/postgresql/data`]: {type: 'persistent', value: `${name}-data`},
        [`/var/log/postgresql`]     : {type: 'persistent', value: `${name}-log`},
      },
      wait: 150,
      envs: {
        // set instances variables
        // Move this to .env file
        [`${upper_name}_USER`]: "azk",
        [`${upper_name}_PASS`]: "azk",
        [`${upper_name}_DB`  ]: "azk",
      },
      export_envs: {
        DATABASE_URL: `${this.protocol || name}://#{envs.${upper_name}_USER}:#{envs.${upper_name}_PASS}` +
          `@#{net.host}:#{net.port.data}/#{envs.${upper_name}_DATABASE}`,
      },
    });

    if (this.rails) {
      suggestion.export_envs_comment = [
        'check this gist to configure your database',
        'https://gist.github.com/gullitmiranda/62082f2e47c364ef9617'
      ];
    }

    return suggestion;
  }

  examine(evidence, evidences) {
    let is_db = evidence.ruleType === "database" &&
                evidence.name === this.name;

    if (is_db) {
      this.image = "azukiapp/postgres:9.4";
      // Is rails app?
      this.rails = this.hasEvidence(evidences, {
        ruleType: "framework", name: "ruby_on_rails"
      });
    }

    return is_db;
  }
}
