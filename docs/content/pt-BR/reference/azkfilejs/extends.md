## extends

Permite herdar um sistema aproveitando suas configurações. É necessário que o sistema seja válido, ou seja, que possa ser chamado individualmente. Todas as propriedades descritas no sistema filho (que possui a propriedade `extends`) irão sobrepor as do sistema pai.

#### Uso:

```js
extends: 'other_base_system_name',
```

##### Exemplos:

Neste exemplo o `system-ruby-child` herda todas as características do sistema `system-ruby-base`.

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

> Observe que foi necessário informar as propriedades `wait` e `scalable` para que o `system-ruby-base` seja considerado um sistema válido.

Outro exemplo:

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
    command: "npm start",
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

> Observe que a variável de ambiente `SERVICE_USERNAME` não existirá dentro do sistema `other`.
