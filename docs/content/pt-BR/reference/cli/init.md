## azk init

  Inicializa um projeto adicionando um `Azkfile.js`.

#### Uso:

  $ azk init [<path>] [options]

#### Argumentos:

```
  path                      Caminho do arquivo de manifesto a ser gerado.
```

#### Opções:

```
  --filename                Mostra o nome do arquivo de manifesto.
  --force, -F               Força a sobrescrita.
  --quiet, -q               Nunca perguntar.
  --help, -h                Mostrar ajuda de uso.
  --log=<level>, -l         Defini o nível de log (padrão: error).
  --verbose, -v             Defini o nível de detalhes da saída - suporta múltiplos (-vv == --verbose 2) [padrão: 0].
```

#### Exemplos:

```
$ azk init -F

azk: [elixir-app] `A elixir` system was detected at '~/azuki/azkfile-init-examples/elixir_app'.
azk: [elixir-app] The image suggested was `{"docker":"azukiapp/elixir"}`.

azk: [elixir-phoenix] `A elixir_phoenix` system was detected at '~/azuki/azkfile-init-examples/elixir_phoenix'.
azk: [elixir-phoenix] The image suggested was `{"docker":"azukiapp/elixir"}`.

azk: [node012] `A node` system was detected at '~/azuki/azkfile-init-examples/node012'.
azk: [node012] The image suggested was `{"docker":"azukiapp/node:0.12"}`.
azk: 'Azkfile.js' generated

Tip:
  Adds the `.azk` to .gitignore
  echo '.azk' >> .gitignore
```
