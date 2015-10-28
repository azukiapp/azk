## azk status

Shows system(s) status.

#### Usage:

    $ azk status [<system>] [options]

#### Arguments:

```
  system                    System name where the action will take place.
```

#### Options:

```
  --long                    Show all columns.
  --short                   Hides 'Provisioned' column.
  --text                    Shows output in plain text mode.
  --quiet, -q               Never prompt.
  --help, -h                Shows help usage.
  --log=<level>, -l         Sets log level (default: error).
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].
```

#### Examples:

```sh
# Displays the 'status' of the azkdemo system showing all columns
$ azk status azkdemo --long
┌───┬─────────┬───────────┬───────────────────────────┬────────────────────────────┬─────────────┬────────────────────┐
│   │ System  │ Instances │ Hostname/url              │ Instances-Ports            │ Provisioned │ Image              │
├───┼─────────┼───────────┼───────────────────────────┼────────────────────────────┼─────────────┼────────────────────┤
│ ↑ │ azkdemo │ 4         │ http://azkdemo.dev.azk.io │ 4-http:32782, 3-http:32781 │ an hour ago │ azukiapp/node:0.12 │
│   │         │           │                           │ 2-http:32780, 1-http:32771 │             │                    │
│   │         │           │                           │                            │             │                    │
└───┴─────────┴───────────┴───────────────────────────┴────────────────────────────┴─────────────┴────────────────────┘

# Displays the 'status' of the azkdemo system in text mode
$ azk status azkdemo --text
 System   Instances  Hostname/url               Instances-Ports                                         Provisioned
 azkdemo  4          http://azkdemo.dev.azk.io  4-http:32782, 3-http:32781, 2-http:32780, 1-http:32771  an hour ago

```
