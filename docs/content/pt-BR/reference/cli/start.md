## azk start

  Inicia um ou mais sistemas.

#### Uso:

    $ azk start [<system>] [options]

#### Argumentos:

  system                    Nome do sistema que receberá a ação.

#### Opções:

  --reprovision, -R         Força o provisionamento do sistema antes de iniciar a instância.
  --rebuild, -B             Força a recriação ou o download da imagem antes de iniciar a instância.
  --open, -o                Abre a URL do sistema no navegador padrão.
  --open-with=<app>, -a     Abre a URL do sistema no navegador espeficado.
  --quiet, -q               Nunca perguntar.
  --help, -h                Mostrar ajuda de uso.
  --log=<level>, -l         Defini o nível de log (padrão: error).
  --verbose, -v             Defini o nível de detalhes da saída - suporta múltiplos (-vv == --verbose 2) [padrão: 0].

#### Exemplos:

```bash
# inicia o sistema azkdemo e já abre o browser padrão
$ azk start azkdemo --open
```
