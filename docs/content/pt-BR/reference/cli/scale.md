## azk scale

Escalona (para cima ou para baixo) um ou mais sistemas.

#### Uso:

    $ azk scale [<system>] [<to>] [options]

#### Argumentos:

```
  system                    Nome do sistema que receberá a ação.
  to                        Número de instâncias disponívels após o escalonamento.
```

#### Opções:

```
  --no-remove, -r           Não remove a instância do container após a parada.
  --no-color                Remove cores na saída padrão
  --quiet, -q               Nunca perguntar.
  --help, -h                Mostrar ajuda de uso.
  --log=<level>, -l         Defini o nível de log (padrão: error).
  --verbose, -v             Defini o nível de detalhes da saída - suporta múltiplos (-vv == --verbose 2) [padrão: 0].
```

#### Exemplos:

###### Altera o número de instâncias do sistema azkdemo para uma instância.

```
$ azk scale azkdemo 1
azk: ↓ scaling `azkdemo` system from 2 to 1 instances...

┌───┬─────────┬───────────┬───────────────────────────┬─────────────────┬───────────────┐
│   │ System  │ Instances │ Hostname/url              │ Instances-Ports │ Provisioned   │
├───┼─────────┼───────────┼───────────────────────────┼─────────────────┼───────────────┤
│ ↑ │ azkdemo │ 1         │ http://azkdemo.dev.azk.io │ 1-http:32771    │ 4 minutes ago │
└───┴─────────┴───────────┴───────────────────────────┴─────────────────┴───────────────┘
```

--------------

###### Altera o número de instâncias do sistema azkdemo para 4 instâncias.

```
$ azk scale azkdemo 4
azk: ↑ scaling `azkdemo` system from 1 to 4 instances...
azk: ✓ checking `azukiapp/node:0.12` image...
azk: ⎘ syncing files for `azkdemo` system...
azk: ◴ waiting for `azkdemo` system to start, trying connection to port http/tcp...
azk: ◴ waiting for `azkdemo` system to start, trying connection to port http/tcp...
azk: ◴ waiting for `azkdemo` system to start, trying connection to port http/tcp...

┌───┬─────────┬───────────┬───────────────────────────┬────────────────────────────┬───────────────┐
│   │ System  │ Instances │ Hostname/url              │ Instances-Ports            │ Provisioned   │
├───┼─────────┼───────────┼───────────────────────────┼────────────────────────────┼───────────────┤
│ ↑ │ azkdemo │ 4         │ http://azkdemo.dev.azk.io │ 4-http:32782, 3-http:32781 │ 6 minutes ago │
│   │         │           │                           │ 2-http:32780, 1-http:32771 │               │
│   │         │           │                           │                            │               │
└───┴─────────┴───────────┴───────────────────────────┴────────────────────────────┴───────────────┘
```

Cada vez que o usuário acessar http://azkdemo.dev.azk.io ele será redirecionado para uma das instâncias pelo _load balancer_ do `azk`.
