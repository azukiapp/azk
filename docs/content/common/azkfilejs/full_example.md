```js
// Adds the systems that shape your system
systems({
  'node-example': {
    // Dependent systems
    depends: ["mysql"],
    // More info about node image: http://images.azk.io/#/node?from=docs-full_example
    image: { docker: "azukiapp/node:0.12" },
    // Steps to execute before running instances
    provision: [
      "npm install",
    ],
    workdir: "/azk/#{manifest.dir}",
    command: ["node", "index.js"],
    mounts: {
      // Mounts folders to assigned paths
      "/azk/#{manifest.dir}": path("."),
    },
    // Start with 2 instances
    scalable: { default: 2},
    // Set hostname to use in http balancer
    http: {
      // node-example.dev.azk.io
      domains: [ "#{system.name}.#{azk.default_domain}" ],
    },
    envs: {
      // Exports global variables
      NODE_ENV: "dev",
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
      // or use splited envs:
      // MYSQL_USER    : "#{envs.MYSQL_USER}",
      // MYSQL_PASSWORD: "#{envs.MYSQL_PASSWORD}",
      // MYSQL_HOST    : "#{net.host}",
      // MYSQL_PORT    : "#{net.port.data}",
      // MYSQL_DATABASE: "#{envs.MYSQL_DATABASE}"
    },
  },
});

// Sets a default system (to use: start, stop, status, scale)
setDefault("node-example");
```
