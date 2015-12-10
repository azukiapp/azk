## Propriedade expansíveis

Podemos utilizar algumas propriedades dentro de _strings_ no `Azkfile.js`. Essas propriedades especiais são substituídas para seu respectivos valores em tempo de execução.

#### Properties:

- __system.name__
  - nome de sistema
- __manifest.dir__
  - nome do diretório no qual o `Azkfile.js` está
- __manifest.path__
  - caminho completo do diretório no qual o `Azkfile.js` está
- __azk.version__
  - versão atual do azk
- __azk.default_domain__
  - parte da URL do domínio do azk (geralmente "dev.azk.io")
- __azk.default_dns__
  - DNS do host utilizado
- __env__
  - expõe um objeto com variáveis de ambientes. Use com notação de ponto: (ex: `env.PWD`)

##### sessão diferente

- *azk.balancer_port*
  - porta do balancedor de carga (_não existem garantias de suporte no futuro_)
- *azk.balancer_ip*
  - IP do balancedor de carga (_não existem garantias de suporte no futuro_)

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

