import { _ } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { example_system } from 'azk/generator/rules';

export class Suggestion extends UIProxy {
  constructor(...args) {
    super(...args);

    // Readable name for this suggestion
    this.name = 'mysql';

    // Which rules they suggestion is valid
    this.ruleNamesList = ['mysql56'];

    // Initial Azkfile.js suggestion
    this.suggestion = _.extend({}, example_system, {
      __type  : 'mysql',
      image   : 'mysql:5.6', //https://registry.hub.docker.com/u/library/mysql/
      ports:{
        data: "3306/tcp",
      },
      balancer: false,
      http: false,
      command: null,
      workdir: null,
      mounts: {
        '/var/lib/mysql': {type: 'persistent', value: 'mysql_lib#{system.name}'},
      },
      wait: {
        retry: 25,
        timeout: 1000
      },
      envs: {
        // set instances variables
        MYSQL_ROOT_PASSWORD: "mysecretpassword",
        MYSQL_USER: "azk",
        MYSQL_PASSWORD: "azk",
        MYSQL_DATABASE: "mysql_development",
      },
      export_envs_comment: [
        'check this gist to configure your database',
        'https://gist.github.com/gullitmiranda/62082f2e47c364ef9617'
      ],
      export_envs: {
        DATABASE_URL: "mysql2://#{envs.MYSQL_USER}:#{envs.MYSQL_PASSWORD}@#{net.host}:#{net.port.data}/${envs.MYSQL_DATABASE}",
      },
    });
  }

  suggest() {
    var suggestion = this.suggestion;
    return suggestion;
  }
}
