import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    var name    = 'php_composer';
    var version = '5.6';
    // Readable name for this suggestion
    this.name = `${name}`;

    // Which rules they suggestion is valid
    this.ruleNamesList = [`${name}`];

    // Initial Azkfile.js suggestion
    this.suggestion = this.extend(this.suggestion, {
      __type   : `${name} ${version}`,
      image    : { docker: `azukiapp/php-fpm:${version}` },
      provision: [
        'composer install',
      ],
      http    : true,
      scalable: { default: 1 },
      command : "npm start",
      ports: {
        http: "80/tcp",
      },
      mounts  : {
        "/azk/#{app.dir}"                       : {type: 'sync', value: '.'},
        "/azk/#{app.dir}/vendor"                : {type: 'persistent', value: "#{system.name}/vendor"},
        "/azk/#{app.dir}/composer.phar"         : {type: 'persistent', value: "#{system.name}/composer.phar"},
        "/azk/#{app.dir}/composer.lock"         : {type: 'path', value: "#{system.name}/composer.lock"},
        "/azk/#{app.dir}/.env.php"              : {type: 'path', value: "#{system.name}/.env.php"},
        "/azk/#{app.dir}/bootstrap/compiled.php": {type: 'path', value: "#{system.name}/bootstrap/compiled.php"},
      },
      envs: {
        APP_DIR: '/azk/#{app.dir}',
      },
    });
  }
}
