## azk restart

Para todas as instâncias dos sistemas especificados no `Azkfile.js` atual, ou aquele especificado, e inicia eles novamente. Mantém o número atual de instâncias, porém, caso ocorra algum erro durante a reinicialização, todos os sistemas serão derrubados.

#### Opções:

- `--verbose, -v, -vv`    Aumenta o nível de detalhes (padrão: falso) - suporta múltiplos
- `--reprovision, -R`     Força o reprovisionamento antes de reiniciar a(s) instância(s) do sistema(s) (padrão: falso)
- `--rebuild, --pull`     Força o _build_ ou _pull_, conforme o _provider_ do sistema. (padrão: falso)

#### Uso:

    $ azk [options] restart [options] [system]

#### Exemplo:

```sh
$ azk restart -R node010

azk: ↓ stopping `node010` system, 2 instances...
azk: ↑ starting `node010` system, 2 new instances...
azk: ✓ checking `node:0.10` image...
azk: ↻ provisioning `node010` system...
azk: ◴ waiting for `node010` system to start, trying connection to port http/tcp...
azk: ◴ waiting for `node010` system to start, trying connection to port http/tcp...

┌───┬─────────┬────────────┬───────────────────────────┬────────────────────────────┬───────────────────┐
│   │ System  │ Instances  │ Hostname                  │ Instances-Ports            │ Provisioned       │
├───┼─────────┼────────────┼───────────────────────────┼────────────────────────────┼───────────────────┤
│ ↑ │ node010 │ 2          │ http://node010.dev.azk.io │ 2-http:49166, 1-http:49165 │ a few seconds ago │
└───┴─────────┴────────────┴───────────────────────────┴────────────────────────────┴───────────────────┘
```
