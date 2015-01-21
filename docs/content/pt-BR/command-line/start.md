## azk start

Inicia todas instâncias dos sistemas especificados no `Azkfile.js` atual, ou aquele especificado.

#### Opções:

- `--verbose, -v, -vv`          Aumenta o nível de detalhes (padrão: falso) - suporta múltiplos
- `--reprovision, -R`           Força o reprovisionamento antes de iniciar a instância do sistema (padrão: falso)
- `--open="application", -o`    Abre a url do sistema padrão na aplicação definida (padrão: browser padrão da máquina)
- `--rebuild, --pull`           Força o _build_ ou _pull_, conforme o _provider_ do sistema (padrão: falso)

#### Uso:

    $ azk [options] start [system] [options]

#### Exemplo:

```bash
# inicia o sistema node010 e já abre o browser padrão
$ azk start node010 --open
```
