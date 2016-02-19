## extends

Allows a system to inherit its settings from another. It's necessary that the "parent system" is valid, i.e., that it could be started individually. All properties described in the "child system" (which has the `extends` property), will override the ones from the "parent system".

#### Usage:

```js
extends: 'other_base_system_name',
```

##### Examples:

In this example, `system-ruby-child` inherits all configurations from `system-ruby-base`.

```js
'system-ruby-base': {
  image   : { docker: 'azukiapp/ruby:latest' },
  shell   : '/bin/bash',
  wait    : false,
  scalable: false,
},

'system-ruby-child':{
  extends : 'system-ruby-base',
  wait    : { retry: 3 },
  scalable: { default: 2 },
  http    : {
    domains: ["#{system.name}.azk.#{azk.default_domain}"],
  },
}
```

> Note that we need to set both `wait` and `scalable` properties so that `system-ruby-base` is a valid system.

Another example:

```js
systems({
  azkdemo: {
    depends: [],
    image: {"docker": "azukiapp/node"},
    provision: [
      "npm install",
    ],
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    command: ["npm", "start"],
    wait: {"retry": 20, "timeout": 1000},
    mounts: {
      '/azk/#{manifest.dir}': path("."),
    },
    scalable: {"default": 2},
    http: {
      domains: [ "#{system.name}.#{azk.default_domain}" ]
    },
    envs: {
      NODE_ENV: "dev",
      SERVICE_USERNAME: "username"
    },
  },
  other: {
    extends: "azkdemo",
    envs: {
      NODE_ENV: "production",
    },
  }
});
```

> Note that the environment variable `SERVICE_USERNAME` will not be available inside the `other` system.
