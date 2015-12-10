## Propriedade expansíveis de template

Podemos utilizar algumas propriedades dentro de _strings_ no `Azkfile.js`. Essas propriedades especiais são expandidas para seu respectivos valores em tempo de execução.

#### Properties:

- *system.name*
  - current system name
- *manifest.dir*
  - current path were Azkfile is
- *manifest.path*
  - xxxxxxxxxx
- *manifest.project_name*
  - xxxxxxxxxx
- *azk.version*
  - xxxxxxxxxx
- *azk.default_domain*
  - xxxxxxxxxx
- *azk.default_dns*
  - xxxxxxxxxx
- *azk.balancer_port*
  - xxxxxxxxxx
- *azk.balancer_ip*
  - xxxxxxxxxx
- *env*
  - xxxxxxxxxx

#### Uso:

Dentro de qualquer string coloque a propriedade expansível como no exemplo abaixo:

```js
'#{system.name}' --> 'mySystem'
```

##### Exemplos:

O exemplo abaixo expõe uma vaiável de ambiente `SYS1_URL` no `sys1`.
O valor em tempo de execução será expandido para `http://sys1.azk.dev.io`.

```js
systems: {
  sys1: {
    envs: {
      SYS1_URL: 'http://#{system.name}.#{azk.default_domain}',
    }
  }
}
```

