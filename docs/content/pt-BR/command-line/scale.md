## azk scale

Aumenta/dimunui o número de instâncias da aplicação.

#### Opções:

	- `--quiet, -q`           Sem mensagens (default: falso)
	- `--remove, -r`          Remove as instâncias antes de parar (padrão: verdadeiro)
    - `--verbose, -v, -vv`    Aumenta o nível de detalhes (padrão: falso) - suporta múltiplos

#### Uso:

    $ azk [options] scale [options] [system] [to]

#### Exemplo:

###### Altera o número de instâncias do sistema node010 para uma instância.

```
$ azk scale node010 1
azk: ↓ scaling `node010` system from 0 to 1 instances...

┌───┬─────────┬───────────┬───────────────────────────┬─────────────────┬──────────────┐
│   │ System  │ Instances │ Hostname/url              │ Instances-Ports │ Provisioned  │
├───┼─────────┼───────────┼───────────────────────────┼─────────────────┼──────────────┤
│ ↑ │ node010 │ 1         │ http://node010.dev.azk.io │ 1-http:49173    │ 2 months ago │
└───┴─────────┴───────────┴───────────────────────────┴─────────────────┴──────────────┘
```

--------------

###### Altera o número de instâncias do sistema node010 para 10 instâncias.
```
$ azk scale node010 10
azk: ↑ scaling `node010` system from 1 to 10 instances...
azk: ✓ checking `library/node:0.10` image...
azk: ◴ waiting for `node010` system to start, trying connection to port http/tcp...
...
┌───┬─────────┬───────────┬───────────────────────────┬─────────────────────────────┬──────────────┐
│   │ System  │ Instances │ Hostname/url              │ Instances-Ports             │ Provisioned  │
├───┼─────────┼───────────┼───────────────────────────┼─────────────────────────────┼──────────────┤
│ ↑ │ node010 │ 10        │ http://node010.dev.azk.io │ 9-http:49209, 8-http:49208  │ 2 months ago │
│   │         │           │                           │ 7-http:49207, 6-http:49206  │              │
│   │         │           │                           │ 5-http:49205, 4-http:49204  │              │
│   │         │           │                           │ 3-http:49203, 2-http:49202  │              │
│   │         │           │                           │ 10-http:49210, 1-http:49173 │              │
│   │         │           │                           │                             │              │
└───┴─────────┴───────────┴───────────────────────────┴─────────────────────────────┴──────────────┘
```
Cada vez que o usuário acessar http://node010.dev.azk.io ele será redirecionado para uma das instâncias pelo _load balancer_ do `azk`.
