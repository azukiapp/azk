## azk open

  Abre a URL de um sistema no navegador.

#### Uso:

```bash
$ azk open [<system>] [options]
```

#### Argumentos:

```
  system                    Nome do sistema que receberá a ação.
```

#### Opções:

```
  --open-with=<app>, -a     Abre a URL do sistema no navegador espeficado.
  --quiet, -q               Nunca perguntar.
  --help, -h                Mostrar ajuda de uso.
  --log=<level>, -l         Defini o nível de log (padrão: error).
  --verbose, -v             Defini o nível de detalhes da saída - suporta múltiplos (-vv == --verbose 2) [padrão: 0].
```

#### Exemplo:

```
$ azk open
azk: Opening http://azkdemo.dev.azk.io in browser.

$ azk open azkdemo
azk: Opening http://azkdemo.dev.azk.io in browser.
```
