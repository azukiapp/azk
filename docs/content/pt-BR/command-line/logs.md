## azk logs

Exibe o _log_ do sistema indicado.

#### Opções:

- `--follow, --tail, -f`  Exibe o log em tempo real (padrão: falso)
- `--lines, -n`           Exibe as `n` últimas linhas do log
- `--timestamps`          Exibe data e hora para cada linha do log (padrão: verdadeiro)

#### Uso:

    $ azk [options] logs [options] [system] [instances]

#### Exemplo:

```
$ azk logs

node0101 2014-12-22T17:17:15.335085996Z
node0101 2014-12-22T17:17:15.335085996Z > application-name@0.0.1 start /azk/azkfile-init-examples/node010
node0101 2014-12-22T17:17:15.335085996Z > node app.js
node0101 2014-12-22T17:17:15.335085996Z
node0101 2014-12-22T17:17:15.440927493Z Express server listening on port 5000
```
