## azk restart

  Para todas as instâncias dos sistemas do `Azkfile.js`, ou do especificado, e inicia novamente. Se encontrar algum erro durante o processe de inicialização, todos os sistemas são parados.

#### Uso:

    $ azk restart [<system>] [options]

#### Argumentos:

```
  system                    Nome do sistema que receberá a ação.
```

#### Opções:

```
  --reprovision, -R         Força o provisionamento do sistema antes de iniciar a instância.
  --rebuild, -B             Força a recriação ou o download da imagem antes de iniciar a instância.
  --open, -o                Abre a URL do sistema no navegador padrão.
  --open-with=<app>, -a     Abre a URL do sistema no navegador espeficado.
  --quiet, -q               Nunca perguntar.
  --help, -h                Mostrar ajuda de uso.
  --log=<level>, -l         Defini o nível de log (padrão: error).
  --verbose, -v             Defini o nível de detalhes da saída - suporta múltiplos (-vv == --verbose 2) [padrão: 0].
```

#### Exemplos:

```sh
$ azk restart -R azkdemo
azk: ↓ stopping `azkdemo` system, 2 instances...
azk: ↑ starting `azkdemo` system, 2 new instances...
azk: ✓ checking `azukiapp/node:0.12` image...
azk: ↻ provisioning `azkdemo` system...
azk: ⎘ syncing files for `azkdemo` system...
azk: ◴ waiting for `azkdemo` system to start, trying connection to port http/tcp...
azk: ◴ waiting for `azkdemo` system to start, trying connection to port http/tcp...

┌───┬─────────┬───────────┬───────────────────────────┬────────────────────────────┬───────────────────┐
│   │ System  │ Instances │ Hostname/url              │ Instances-Ports            │ Provisioned       │
├───┼─────────┼───────────┼───────────────────────────┼────────────────────────────┼───────────────────┤
│ ↑ │ azkdemo │ 2         │ http://azkdemo.dev.azk.io │ 2-http:32772, 1-http:32771 │ a few seconds ago │
│   │         │           │                           │                            │                   │
└───┴─────────┴───────────┴───────────────────────────┴────────────────────────────┴───────────────────┘
```
