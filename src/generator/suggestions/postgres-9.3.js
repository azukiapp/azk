import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { example_system } from 'azk/generator/rules';

export class Suggestion extends UIProxy {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'postgres';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['postgres-9.3'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, example_system, {
      __type  : 'postgres',
      image   : { docker: 'azukiapp/postgres:9.3' },
      ports:{
        data: "5432/tcp",
      },
      balancer: false,
      http: false,
      command: null,
      workdir: null,
      mounts  : {
        '/var/lib/postgresql/data' : {type: 'persistent', value: 'postgresql'},
        '/var/log/postgresql' : {type: 'path', value: './log/postgresql'},
      },
      envs: {
        // set instances variables
        // Move this to .env file
        POSTGRESQL_USER: "azk",
        POSTGRESQL_PASS: "azk",
        POSTGRESQL_DB  : "postgres_development",
      },
      export_envs_comment: [
        'check this gist to configure your database',
        'https://gist.github.com/gullitmiranda/62082f2e47c364ef9617'
      ],
      export_envs: {
        DATABASE_URL: "postgres://#{envs.POSTGRESQL_USER}:#{envs.POSTGRESQL_PASS}" +
          "@#{net.host}:#{net.port.data}/${envs.POSTGRESQL_DB}",
      },
    });
  }
}
