```js
// Adds the systems that shape your system
systems({
  'my-node-app': {
    depends: ['mongodb'],
    image: {'docker': 'azukiapp/node'},
    provision: [
      'npm install',
    ],
    workdir: '/azk/#{manifest.dir}',
    shell: '/bin/bash',
    command: 'npm start',
    wait: {'retry': 20, 'timeout': 1000},
    mounts: {
      '/azk/#{manifest.dir}': path('.'),
    },
    scalable: {'default': 1},
    http: {
      domains: [ '#{system.name}.#{azk.default_domain}' ]
    },
    ports: {
      http: '8000'
    },
    envs: {
      NODE_ENV: 'dev',
      NODE_PORT: '8000'
    },
  },

  'mongodb': {
    image : { docker: 'azukiapp/mongodb' },
    scalable: false,
    wait: {'retry': 20, 'timeout': 1000},
    mounts: {
      '/data/db': persistent('mongodb-#{manifest.dir}'),
    },
    ports: {
      http: '28017:28017/tcp',
    },
    http: {
      domains: [ '#{manifest.dir}-#{system.name}.#{azk.default_domain}' ],
    },
    export_envs: {
      MONGODB_URI: 'mongodb://#{net.host}:#{net.port[27017]}/#{manifest.dir}_development',
    },
  },
});

```
