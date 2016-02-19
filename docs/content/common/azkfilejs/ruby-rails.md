```js
systems({
  "my-app": {
    depends: ["mysql"],
    image: {"docker": "azukiapp/ruby"},
    provision: [
      "bundle install --path /azk/bundler",
      "bundle exec rake db:setup",
    ],
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    command: ["bundle", "exec", "puma", "-C", "config/puma.rb"],
    wait: 20,
    mounts: {
      '/azk/#{manifest.dir}': sync("."),
      '/azk/bundler': persistent("./bundler"),
      '/azk/#{manifest.dir}/tmp': persistent("./tmp"),
      '/azk/#{manifest.dir}/log': path("./log"),
      '/azk/#{manifest.dir}/.bundle': path("./.bundle"),
    },
    scalable: {"default": 1},
    http: {
      domains: [ "#{system.name}.#{azk.default_domain}" ]
    },
    ports: {
      http: "7000/tcp",
    },
    envs: {
      RAILS_ENV: "development",
      RACK_ENV: "development",
      BUNDLE_APP_CONFIG: "/azk/bundler",
    },
  },
  mysql: {
    // More info about mysql image: http://images.azk.io/#/mysql?from=docs-full_example
    image: {"docker": "azukiapp/mysql:5.7"},
    shell: "/bin/bash",
    wait: 25,
    mounts: {
      '/var/lib/mysql': persistent("mysql_data"),
      // to clean mysql data, run:
      // $ azk shell mysql -c "rm -rf /var/lib/mysql/*"
    },
    ports: {
      // exports global variables: "#{net.port.data}"
      data: "3306/tcp",
    },
    envs: {
      // set instances variables
      MYSQL_USER         : "azk",
      MYSQL_PASSWORD     : "azk",
      MYSQL_DATABASE     : "#{manifest.dir}_development",
      MYSQL_ROOT_PASSWORD: "azk",
    },
    export_envs: {
      // check this gist to configure your database
      // https://gist.github.com/gullitmiranda/62082f2e47c364ef9617
      DATABASE_URL: "mysql2://#{envs.MYSQL_USER}:#{envs.MYSQL_PASSWORD}@#{net.host}:#{net.port.data}/#{envs.MYSQL_DATABASE}",
    },
  },
  // run test:
  // $ azk shell test -c "bundle exec rake test"
  test: {
    extends: "my-app",
    depends: ["mysql-test"],
    command: ["bundle", "exec", "rake", "test", "&&", "exit 0"],
    provision: [
      "bundle install --no-deployment --path /azk/bundler",
      "bundle exec rake db:create",
      "bundle exec rake db:migrate",
    ],
    scalable: { default: 0, limit: 1 },
    http: false,
    wait: false,
    envs: {
      RACK_ENV: "test",
      RAILS_ENV: "test",
      BUNDLE_APP_CONFIG: "/azk/bundler",
    },
  },
  "mysql-test": {
    extends: "mysql",
    scalable: { default: 0, limit: 1 },
    envs: {
      MYSQL_USER         : "azk",
      MYSQL_PASSWORD     : "azk",
      MYSQL_DATABASE     : "#{manifest.dir}_test",
      MYSQL_ROOT_PASSWORD: "azk",
    },
  },
});

// Sets a default system (to use: start, stop, status, scale)
setDefault("my-app");
```
