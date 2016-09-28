import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions/postgres';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);
    this.analytics = true;
    this.name = 'mysql';
  }

  get suggestion() {
    // Initial Azkfile.js suggestion
    let suggestion = this.extend({}, super.suggestion, {
      __type: `${this.name} ${this.version}`,
      ports:{
        data: "3306/tcp",
      },
      envs: {
        MYSQL_USER: "azk",
        MYSQL_PASS: "azk",
        MYSQL_DATABASE: "azk",
        MYSQL_ALLOW_EMPTY_PASSWORD: true,
      },
      mounts: {
        '/var/lib/mysql': {type: 'persistent', value: '#{manifest.dir}/mysql'},
      },
    });

    return suggestion;
  }

  examine(evidence, evidences) {
    let is_db = super.examine(evidence, evidences);
    if (is_db) {
      this.protocol = 'mysql2';
      this.version  = "5.6";
      this.image    = "azukiapp/mysql:" + this.version;
    }
    return is_db;
  }
}
