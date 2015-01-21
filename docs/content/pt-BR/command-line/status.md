## azk status

Exibe o _status_ da instância de um sistema ou de todos os sistemas a partir do _Azkfile.js_ encontrado.

#### Opções:

- `--text, -t`  Exibe em modo texto (padrão: falso)
- `--long, -l`  Exibe todas as colunas (padrão: falso)

#### Uso:

    $ azk [options] status [system] [options]

#### Exemplos:

```sh
# Exibe o 'status' do sistema node010 exibindo todas as colunas
$ azk status node010 -l

┌───┬─────────┬────────────┬────────────────────────┬────────────────────────────┬────────────────┬───────────┐
│   │ System  │ Instances  │ Hostname               │ Instances-Ports            │ Provisioned    │ Image     │
├───┼─────────┼────────────┼────────────────────────┼────────────────────────────┼────────────────┼───────────┤
│ ↑ │ node010 │ 2          │ http://node010.azk.dev │ 2-http:49166, 1-http:49165 │ 21 minutes ago │ node:0.10 │
│   │         │            │                        │                            │                │           │
└───┴─────────┴────────────┴────────────────────────┴────────────────────────────┴────────────────┴───────────┘

# Exibe o 'status' do sistema node010 em modo texto
$ azk status node010 -t
    System   Instancies  Hostname                Instances-Ports             Provisioned
 ↑  node010  2           http://node010.azk.dev  2-http:49166, 1-http:49165  23 minutes ago

```
