## docker_extra

> __Importante__: Esta opção está aqui apenas como referência, ela deve ser evita a todo custo e seu suporte pode deixar de existir sem nenhum aviso prévio ou retrocompatibilidade.

Permite personalizar as opções passadas ao [Docker Remote API][docker_remote_api] no momento da criação de um container. Todas as opções disponíveis [aqui][docker_remote_api_create] são suportadas.

Deve-se observar que algumas das opções podem conflitar com as opções passadas pelo próprio `azk`, tais como:

* `Name`
* `Image`
* `Cmd`
* `AttachStdin`
* `AttachStdout`
* `AttachStderr`
* `Tty`
* `OpenStdin`
* `ExposedPorts`
* `Env`
* `WorkingDir`
* `HostConfig.Binds`
* `HostConfig.PortBindings`
* `HostConfig.Dns`

Porém, como todo opção "backdoor", podem existir casos além dos listados acima. Use com cuidado :)

##### Exemplo:

Restringindo a quantidade de memória utilizada pelos containers do sistema `web`:

```javascript
systems({
  'web': {
    // ...
    docker_extra: {
      HostConfig: { Memory: 120 },
    },
  },
});
```

!INCLUDE "../../../links.md"
