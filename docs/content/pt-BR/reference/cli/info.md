## azk info

  Exite informações dos sistemas do atual `Azkfile.js`.

#### Usage:

    azk info [<system>] [options]

#### Examples:

```
azk info
azk info web
azk info web,worker --filter=mounts,env
```

####  Opções:

```
  --json                    Gera uma saída no formato json.
  --filter=<props>          Filtras quais as propriedades [padrão: all].
  --quiet, -q               Nunca perguntar.
  --help, -h                Mostrar ajuda de uso.
  --no-color                Remove cores na saída padrão
  --log=<level>, -l         Defini o nível de log (padrão: error).
  --verbose, -v             Defini o nível de detalhes da saída - suporta múltiplos (-vv == --verbose 2) [padrão: 0].
```
