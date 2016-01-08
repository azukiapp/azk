## azk status

  Mostra o statys dos sistemas.

#### Uso:

    $ azk status [<system>] [options]

#### Argumentos:

```
  system                    Nome do sistema que receberá a ação.
```

#### Opções:

```
  --long                    Exibe todas colunas.
  --short                   Oculta a coluna 'Provisioned'.
  --text                    Exibe a saida em modo apenas texto.
  --no-color                Remove cores na saída padrão
  --quiet, -q               Nunca perguntar.
  --help, -h                Mostrar ajuda de uso.
  --log=<level>, -l         Defini o nível de log (padrão: error).
  --verbose, -v             Defini o nível de detalhes da saída - suporta múltiplos (-vv == --verbose 2) [padrão: 0].
```

#### Exemplos:

```sh
# Exibe o 'status' do sistema azkdemo exibindo todas as colunas
$ azk status azkdemo --long
┌───┬─────────┬───────────┬───────────────────────────┬────────────────────────────┬─────────────┬────────────────────┐
│   │ System  │ Instances │ Hostname/url              │ Instances-Ports            │ Provisioned │ Image              │
├───┼─────────┼───────────┼───────────────────────────┼────────────────────────────┼─────────────┼────────────────────┤
│ ↑ │ azkdemo │ 4         │ http://azkdemo.dev.azk.io │ 4-http:32782, 3-http:32781 │ an hour ago │ azukiapp/node:0.12 │
│   │         │           │                           │ 2-http:32780, 1-http:32771 │             │                    │
│   │         │           │                           │                            │             │                    │
└───┴─────────┴───────────┴───────────────────────────┴────────────────────────────┴─────────────┴────────────────────┘

# Exibe o 'status' do sistema azkdemo em modo texto
$ azk status azkdemo --text
 System   Instances  Hostname/url               Instances-Ports                                         Provisioned
 azkdemo  4          http://azkdemo.dev.azk.io  4-http:32782, 3-http:32781, 2-http:32780, 1-http:32771  an hour ago

```
