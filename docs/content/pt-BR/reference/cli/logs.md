## azk logs

  Exibe os logs do sistema.

#### Uso:

    $ azk logs [<system> <instances>] [options]

#### Argumentos:

```
  system                    Nome do sistema que receberá a ação.
  instances                 Número da instância.
```

#### Opções:

```
  --no-timestamps           Ocultar data e hora.
  --follow, -f              Ficar conectado a saída de log.
  --lines=<n>, -n           Especificá o número final de linhas finais a serem exibidas [padrão: todas].
  --no-color                Remove cores na saída padrão
  --quiet, -q               Nunca perguntar.
  --help, -h                Mostrar ajuda de uso.
  --log=<level>, -l         Defini o nível de log (padrão: error).
  --verbose, -v             Defini o nível de detalhes da saída - suporta múltiplos (-vv == --verbose 2) [padrão: 0].
```

#### Exemplos:

```
$ azk logs azkdemo -f
azkdemo1 2015-06-12T20:10:15.703152634Z
azkdemo1 2015-06-12T20:10:15.703253658Z > azkdemo@0.0.1 start /azk/azkdemo
azkdemo1 2015-06-12T20:10:15.703278293Z > nodemon ./index.js
azkdemo1 2015-06-12T20:10:15.703296165Z
```
