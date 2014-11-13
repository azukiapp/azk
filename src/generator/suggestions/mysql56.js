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
        portA: "3306/tcp",
      },
      balancer: false,
      http: false,
      shell   : '/bin/bash',
      mounts  : {
        '/var/lib/mysql': {type: 'persistent', value: 'mysql_lib#{system.name}'}
      },
      envs: {
        // set instances variables
        MYSQL_ROOT_PASSWORD: "mysecretpassword",
        MYSQL_USER: "azk",
        MYSQL_PASSWORD: "password",
        MYSQL_DATABASE: "my_database",
      },
      export_envs: {
        DATABASE_URL: "mysql://#{envs.MYSQL_USER}:#{envs.MYSQL_PASSWORD}@#{net.host}:#{net.port.data}/${envs.MYSQL_DATABASE}",
      },
    });
  }

  suggest() {
    var suggestion = this.suggestion;
    delete suggestion.workdir;
    delete suggestion.command;


    /****** DEBUG ******************************************************************/
    /******************************************************************************/
    var debugSource = suggestion;
    var util = require('util');
    var scrubbed = util.inspect(debugSource, {
      showHidden: true,
      depth: 3,
      colors: true
    });

    console.log(
      '\n>>------------------------------------------------------\n' +
      '  source: ( ' + __filename + ' )'                             +
      '\n  ------------------------------------------------------\n' +
      '  $ suggestion'                                                     +
      '\n  ------------------------------------------------------\n' +
         scrubbed                                                    +
      '\n<<------------------------------------------------------\n'
    );

    /******************************************************************************/
    /****** \DEBUG ***************************************************************/


    return suggestion;
  }
}
