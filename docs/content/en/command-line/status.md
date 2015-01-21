## azk status

Displays the _status_ of a system instance or all systems from the _Azkfile.js_.

#### Options:

- `--text, -t`  Displays in text mode (default: false)
- `--long, -l`  Displays all the columns (default: false)

#### Usage:

    $ azk [options] status [system] [options]

#### Examples:

```sh
# Displays the 'status' of the node010 system showing all columns
$ azk status node010 -l

┌───┬─────────┬────────────┬────────────────────────┬────────────────────────────┬────────────────┬───────────┐
│   │ System  │ Instances  │ Hostname               │ Instances-Ports            │ Provisioned    │ Image     │
├───┼─────────┼────────────┼────────────────────────┼────────────────────────────┼────────────────┼───────────┤
│ ↑ │ node010 │ 2          │ http://node010.azk.dev │ 2-http:49166, 1-http:49165 │ 21 minutes ago │ node:0.10 │
│   │         │            │                        │                            │                │           │
└───┴─────────┴────────────┴────────────────────────┴────────────────────────────┴────────────────┴───────────┘

# Displays the 'status' of the node010 system in text mode
$ azk status node010 -t
    System   Instancies  Hostname                Instances-Ports             Provisioned
 ↑  node010  2           http://node010.azk.dev  2-http:49166, 1-http:49165  23 minutes ago

```
