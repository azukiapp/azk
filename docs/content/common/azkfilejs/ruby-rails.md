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
    command: "bundle exec puma -C config/puma.rb",
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
    depends: [],
    image: {"docker": "azukiapp/mysql:5.6"},
    shell: "/bin/bash",
    wait: 25,
    mounts: {
      '/var/lib/mysql': persistent("#{manifest.dir}/mysql"),
    },
    ports: {
      data: "3306/tcp",
    },
    envs: {
      MYSQL_ROOT_PASSWORD: "your-root-password",
      MYSQL_USER: "root",
      MYSQL_PASS: "your-password",
      MYSQL_DATABASE: "#{manifest.dir}_development",
    },
    export_envs: {
      DATABASE_URL: "mysql2://#{envs.MYSQL_USER}:#{envs.MYSQL_PASS}@#{net.host}:#{net.port.data}/${envs.MYSQL_DATABASE}",
    },
  },
  test: {
    extends: "my-app",
    depends: ["mysql-test"],
    command: "bundle exec rake test && exit 0",
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
      MYSQL_ROOT_PASSWORD: "your-root-test-password",
      MYSQL_USER: "root",
      MYSQL_PASS: "your-test-password",
      MYSQL_DATABASE: "#{manifest.dir}_test",
    },
  },
});
```
