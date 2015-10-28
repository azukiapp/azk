## azk scale

  Scales (up or down) one or more systems.

#### Usage:

    $ azk scale [<system>] [<to>] [options]

#### Arguments:

```
  system                    System name where the action will take place.
  to                        Number of available instances after scaling.
```

#### Options:

```
  --no-remove, -r           Do not remove container instances after stopping them.
  --quiet, -q               Never prompt.
  --help, -h                Shows help usage.
  --log=<level>, -l         Sets log level (default: error).
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].
```

#### Example:

###### Changes azkdemo system instances number to one.

```
$ azk scale azkdemo 1
azk: ↓ scaling `azkdemo` system from 2 to 1 instances...

┌───┬─────────┬───────────┬───────────────────────────┬─────────────────┬───────────────┐
│   │ System  │ Instances │ Hostname/url              │ Instances-Ports │ Provisioned   │
├───┼─────────┼───────────┼───────────────────────────┼─────────────────┼───────────────┤
│ ↑ │ azkdemo │ 1         │ http://azkdemo.dev.azk.io │ 1-http:32771    │ 4 minutes ago │
└───┴─────────┴───────────┴───────────────────────────┴─────────────────┴───────────────┘
```

--------------

###### Changes azkdemo system instances's number to 4.

```
$ azk scale azkdemo 4
azk: ↑ scaling `azkdemo` system from 1 to 4 instances...
azk: ✓ checking `azukiapp/node:0.12` image...
azk: ⎘ syncing files for `azkdemo` system...
azk: ◴ waiting for `azkdemo` system to start, trying connection to port http/tcp...
azk: ◴ waiting for `azkdemo` system to start, trying connection to port http/tcp...
azk: ◴ waiting for `azkdemo` system to start, trying connection to port http/tcp...

┌───┬─────────┬───────────┬───────────────────────────┬────────────────────────────┬───────────────┐
│   │ System  │ Instances │ Hostname/url              │ Instances-Ports            │ Provisioned   │
├───┼─────────┼───────────┼───────────────────────────┼────────────────────────────┼───────────────┤
│ ↑ │ azkdemo │ 4         │ http://azkdemo.dev.azk.io │ 4-http:32782, 3-http:32781 │ 6 minutes ago │
│   │         │           │                           │ 2-http:32780, 1-http:32771 │               │
│   │         │           │                           │                            │               │
└───┴─────────┴───────────┴───────────────────────────┴────────────────────────────┴───────────────┘
```

Each time the user accesses http://azkdemo.dev.azk.io he will be redirected to one of _azkdemo system 4 instances_ by `azk`'s _load balancer_.
