## Expand template properties

We can use some properties inside Azkfile that is expanded to runtime values.

#### Properties:

- system.name
  - current system name
- manifest.dir
  - current path were Azkfile is
- manifest.path
- manifest.project_name
- azk.version
- azk.default_domain
- azk.default_dns
- azk.balancer_port
- azk.balancer_ip
- env

#### Usage:

Inside any string you can put this simbol: `#{}`

```js
'#{system.name}' --> 'mySystem'
```

##### Examples:

The example bellow will expose an environment variable named SYS1_URL with the value: `http://sys1.azk.dev.io`

```js
systems: {
  sys1: {
    envs: {
      SYS1_URL: 'http://#{system.name}.#{azk.default_domain}',
    }
  }
}
```

