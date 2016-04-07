import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    var name    = 'mysql';
    var version = '5.6';
    // Readable name for this suggestion
    this.name = `${name}-${version}`;

    // Which rules they suggestion is valid
    this.ruleNamesList = [`${name}-${version}`];

    // Initial Azkfile.js suggestion
    this.suggestion = this.extend({}, this.suggestion, {
      __type: `${name} ${version}`,
      image : { docker: `azukiapp/${name}:${version}` },
      ports:{
        data: "3306/tcp",
      },
      balancer: false,
      http: false,
      command: null,
      workdir: null,
      mounts: {
        '/var/lib/mysql': {type: 'persistent', value: '#{manifest.dir}/mysql'},
      },
      wait: 150,
      envs: {
        // set instances variables
        MYSQL_USER    : "azk",
        MYSQL_PASSWORD: "azk",
        MYSQL_DATABASE: "#{manifest.dir}_development",
      },
      export_envs_comment: [
        'check this gist to configure your database',
        'https://gist.github.com/gullitmiranda/62082f2e47c364ef9617'
      ],
      export_envs: {
        DATABASE_URL: "mysql2://#{envs.MYSQL_USER}:#{envs.MYSQL_PASSWORD}@#{net.host}" +
                      ":#{net.port.data}/#{envs.MYSQL_DATABASE}",
      },
    });
  }
}
