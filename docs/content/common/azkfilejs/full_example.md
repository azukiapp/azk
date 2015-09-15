```js
// Adds the systems that shape your system
systems({
  'node-example': {
    // Dependent systems
    depends: ["db"],
    // More images:  http://registry.hub.docker.com
    image: { docker: "azukiapp/node" },
    // Steps to execute before running instances
    provision: [
      "npm install",
    ],
    workdir: "/azk/#{manifest.dir}",
    command: "node index.js",
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

  db: {
    image: { docker: "azukiapp/mysql" },
    mounts: {
      // Activates a persistent data folder in '/data'
      "/data": persistent("data-#{system.name}"),
    },
    ports: {
      data: "3306/tcp",
    },
    envs: {
      MYSQL_PASS: "password",
      MYSQL_USER: "admin",
    },
    export_envs: {
      DATABASE_URL:
        "mysql://#{envs.MYSQL_USER}:#{envs.MYSQL_PASS}@#{net.host}:#{net.port.data}/",
    },
  },
});

// Sets a default system (to use: start, stop, status, scale)
setDefault("node-example");
```
