# Propriedade expansíveis

Podemos utilizar algumas propriedades dentro de _strings_ no `Azkfile.js`. Essas propriedades especiais são substituídas para seu respectivos valores em tempo de execução.

## Índice:

1. [Propriedades Expansíveis Gerais](#propriedades-expansíveis-gerais)
  1. [#{system.name}](#systemname)
  1. [#{manifest.dir}](#manifestdir)
  1. [#{manifest.path}](#manifestpath)
  1. [#{azk.version}](#azkversion)
  1. [#{azk.default_domain}](#azkdefault_domain)
  1. [#{azk.default_dns}](#azkdefault_dns)
  1. [#{env}](#env)
1. [Propriedades Expansíveis Exportáveis](#propriedades-expansíveis-exportáveis)
  1. [#{net.host}](#nethost)
  1. [#{net.port}](#netport)
  1. [#{envs}](#envs)
1. [Propriedades Expansíveis do Load Balancer](#propriedades-expansíveis-do-load-balancer)
  1. [#{azk.balancer_ip}](#azkbalancer_ip)
  1. [#{azk.balancer_port}](#azkbalancer_port)

## Propriedades Expansíveis Gerais:

##### `#{system.name}`

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

--------------------

##### `#{manifest.dir}`

Nome do diretório no qual o `Azkfile.js` está.

_Exemplo_:

Neste exemplo definimos o `workdir` como sendo `/azk/test`, visto que o diretório onte está o arquivo manifesto (`Azkfile.js`) se chama `test`.

```js
systems({
  sys1: {
    ...
    workdir: '/azk/#{manifest.dir}',
  }
});
```

```sh
$ azk shell
/home/projects/test

$ azk shell -c 'pwd'
/azk/test
```

--------------------

##### `#{manifest.path}`

Caminho completo do diretório no qual o `Azkfile.js` está

_Exemplo_:

```js
systems: {
  sys1: {
    envs: {
      HOST_MANIFEST_FULL_PATH: '#{manifest.path}',
    }
  }
}
```

```sh
$ pwd
/home/projects/test

$ azk shell -c 'env'
HOST_MANIFEST_FULL_PATH=/home/projects/test
```

--------------------

##### `#{azk.version}`

Versão atual do `azk`

_Exemplo_:

```js
systems: {
  sys1: {
    envs: {
      AZK_VERSION: '#{azk.version}',
    }
  }
}
```

```sh
$ azk shell -c 'env'
AZK_VERSION=0.16.3
```

--------------------

##### `#{azk.default_domain}`

Nome do domínio utilizado pelo `azk` (`dev.azk.io`, por padrão).

_Exemplo_:

Este é uso mais comum do `#{azk.default_domain}`, concatenado com o nome do sistema.

```js
systems: {
  sys1: {
    http: {
      domains: [ '#{system.name}.#{azk.default_domain}' ],
    },
  }
}
```

```sh
$ azk status --text
 System  Instances  Hostname/url     Instances-Ports  Provisioned
 sys1    0          sys1.dev.azk.io  -                -
```

--------------------

##### `#{azk.default_dns}`

Lista de endereços dos serviços de DNS disponíveis, separados por vírgula, na seguinte ordem:

- DNS do `azk`;
- DNS do `/etc/resolv.conf`;

_Exemplo_:

```js
systems: {
  sys1: {
    envs: {
      ALL_DNS: '#{azk.default_dns}',
    }
  }
}
```

```sh
$ azk shell -c 'env'
ALL_DNS=172.17.0.1,8.8.8.8,8.8.4.4
```

--------------------

##### `#{env}`

Objeto com as variáveis de ambiente disponíveis na máquina local. Use com notação de ponto (`env.VAR`).

__Alerta de Segurança:__ Observe que, como o `Azkfile.js` é parte do código, dados confidenciais (como senhas e tokens privados) não devem ser colocados aqui. Ao invés disso, use um arquivo `.env` e não adicione-o ao seu sistema de controle de versão.


_Exemplo_:

```js
systems: {
  sys1: {
    envs: {
      AZK_ENV: '#{env.AZK_ENV}',
    }
  }
}
```

```sh
$ azk shell -c 'env'
AZK_ENV=development
```

--------------------

## Propriedades Expansíveis Exportáveis

As propriedades expansíveis `net.host`, `net.port` e `envs` só pode ser utilizadas na sessão `export_envs` do `Azkfile.js`. Isso se dá pois estas propriedades só estão disponíveis com o sistema em execução.

##### `#{net.host}`

Endereço do host do sistema atual. Geralmente o `#{net.host}`, quando não definido nenhum `http.domain`, é `azk.dev.io`, ou seja, o mesmo que o `#{azk.default_domain}`.

--------------------

##### `#{net.port}`

Porta nomeada exportada para o sistema dependente. Observe que sempre devemos chamar essa propriedade informando o nome da porta (`#{net.port.NOME_DA_PORTA}`). No exemplo dessa sessão existe uma porta nomeada `data` que na exportação da variáveis de ambiente (`export_envs`) é referenciada desta forma: `#{net.port.data}`.

--------------------

##### `#{envs}`

Variáveis de ambiente para serem exportadas para os sistemas dependentes a partir das variáveis de ambiente declaradas na propriedade `envs`.

>Não confundir com `#{env}`.

--------------------

_Exemplo_:

`/tmp/project/Azkfile.js`

```js
systems: {
  main_system: {
    depends: ['mysql']
  }
  mysql: {
    image: { docker: 'azukiapp/mysql:5.6' },
    ports: {
      // porta nomeada: data
      data: '3306/tcp',
    },
    envs: {
      // variáveis de ambiente
      // para dados confidenciais, utilize um arquivo `.env`
      MYSQL_USER: 'azk',
      MYSQL_PASS: 'azk',
      MYSQL_DATABASE: '#{manifest.dir}_development',
    },
    export_envs: {
      // Exportando o DATABASE_URL (popularizado com o Rails).
      // Observe que aqui estamos utilizando o `envs` e não o `env`.
      // mais informações: https://gist.github.com/gullitmiranda/62082f2e47c364ef9617
      DATABASE_URL: 'mysql2://#{envs.MYSQL_USER}:#{envs.MYSQL_PASS}@#{net.host}:#{net.port.data}/#{envs.MYSQL_DATABASE}',
    }
  },
}
```

```sh
$ azk shell main_system -c 'env'
MYSQL_USER: 'azk'
MYSQL_PASS: 'azk'
MYSQL_DATABASE: 'project_development'
DATABASE_URL=mysql2://azk:azk@dev.azk.io:32772/project_development
```

--------------------

## Propriedades Expansíveis do Load Balancer

> Para as propriedade expansíveis abaixo _não existem garantias de suporte no futuro_. Use com cautela.

##### `#{azk.balancer_ip}`

IP do balancedor de carga

##### `#{azk.balancer_port}`

Porta do balancedor de carga

_Exemplo_:

```js
systems: {
  sys1: {
    envs: {
      BALANCER_IP:   '#{azk.balancer_ip}',
      BALANCER_PORT: '#{azk.balancer_port}',
    }
  }
}
```

```sh
$ azk shell -c 'env'
BALANCER_IP=172.17.0.1
BALANCER_PORT=80
```
