```js
systems({
  "wordpress": {
    depends: ["mysql"],
    image: {"docker": "azukiapp/php-fpm"},
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    wait: 20,
    mounts: {
      '/azk/#{manifest.dir}': path("."),
    },
    scalable: {"default": 1},
    http: {
      domains: [ "#{system.name}.#{azk.default_domain}" ]
    },
    ports: {
      http: "80/tcp",
    },
    envs: {
      APP_DIR: "/azk/#{manifest.dir}",
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
      MYSQL_USER    : "#{envs.MYSQL_USER}",
      MYSQL_PASSWORD: "#{envs.MYSQL_PASSWORD}",
      MYSQL_HOST    : "#{net.host}",
      MYSQL_PORT    : "#{net.port.data}",
      MYSQL_DATABASE: "#{envs.MYSQL_DATABASE}"
    },
  },
  "phpmyadmin": {
    depends: ["mysql"],
    image: { docker: "reduto/phpmyadmin" },
    wait: {retry: 20, timeout: 1000},
    scalable: {default: 0, limit: 1},
    http: {
      domains: [ "#{system.name}.#{azk.default_domain}" ]
    },
    ports: {
      http: "80/tcp",
    },
  },
});

// Sets a default system (to use: start, stop, status, scale)
setDefault("wordpress");
```
