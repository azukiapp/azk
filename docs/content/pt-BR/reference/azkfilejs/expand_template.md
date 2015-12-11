## Propriedade expansíveis

Podemos utilizar algumas propriedades dentro de _strings_ no `Azkfile.js`. Essas propriedades especiais são substituídas para seu respectivos valores em tempo de execução.

#### propriedades expansíveis comuns:

###### `${system.name}`
Nome do sistema atual.

_Exemplo_:

```js
systems: {
  sys1: {
    envs: {
      SYSTEM_NAME: '#{system.name}',
    }
  }
}
```

```sh
$ azk shell -c 'env'
SYSTEM_NAME=sys1
```


###### `${manifest.dir}`
Nome do diretório no qual o `Azkfile.js` está.

_Exemplo_:

```js
systems: {
  sys1: {
    envs: {
      DIR_NAME: '#{manifest.dir}',
    }
  }
}
```

```sh
$ pwd
/home/projects/test

$ azk shell -c 'env'
DIR_NAME=test
```

- __manifest.path__
  - caminho completo do diretório no qual o `Azkfile.js` está

- __azk.version__
  - versão atual do azk

- __azk.default_domain__
  - parte da URL do domínio do azk (geralmente "dev.azk.io")

- __azk.default_dns__
  - compilado das DNSs, seguindo a ordem:
    - DNS do azk
    - DNS do `/etc/resolv.conf

- __env.NOME_DA_ENV__
  - expõe um objeto com variáveis de ambientes. Use com notação de ponto: (ex: `env.PWD`)

##### export.envs

As propriedade expansíveis `net.host` e `net.port` só pode ser utilizadas em `export_envs`. Isso se dá pois precisam que o sistema já tenha sido executado.

- __net.host[.http]__
  - `net.host` sem informar o nome da propriedade de `domains`, representa a URL do domínio exportado na propriedade `domain.http`
  - `net.host.NAME` URL do host exportado na propriedade `domain.NAME`

- __net.port.NOME_DA_PORTA__
  - porta para ser _exportada_ para o sistema que depende.

##### balancer

> Para as propriedade expansíveis abaixo _não existem garantias de suporte no futuro_. Use com cautela.

- *azk.balancer_port*
  - porta do balancedor de carga
- *azk.balancer_ip*
  - IP do balancedor de carga

#### Uso:

Dentro de qualquer string coloque a propriedade expansível como no exemplo abaixo:

```js
'#{system.name}' --> 'mySystem'
```

##### Exemplo:

No exemplo ilustrativo abaixo, o valor em tempo de execução da variável de ambiente `SYS1_URL` será expandido para `http://sys1.azk.dev.io`.

```js
systems: {
  sys1: {
    envs: {
      SYS1_URL: 'http://#{system.name}.#{azk.default_domain}',
    }
  }
}
```

