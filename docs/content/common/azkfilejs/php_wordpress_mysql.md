```js
systems({
  "wordpress-test": {
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
    image: {"docker": "azukiapp/mysql:5.7"},
    shell: "/bin/bash",
    wait: 25,
    mounts: {
      '/var/lib/mysql': persistent("#{manifest.dir}/xmysql"),
    },
    ports: {
      data: "3306/tcp",
    },
    envs: {
      MYSQL_ROOT_PASSWORD: "your-root-password",
      MYSQL_USER: "your-user",
      MYSQL_PASS: "your-password",
      MYSQL_DATABASE: "#{manifest.dir}_development"
    },
    export_envs: {
      MYSQL_USER: "your-user",
      MYSQL_PASS: "your-password",
      MYSQL_DATABASE: "#{manifest.dir}_development"
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
```
