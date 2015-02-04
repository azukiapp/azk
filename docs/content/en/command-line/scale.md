## azk scale

Increase/decrease the number of applications instances.

#### Options:

    - `--verbose, -v, -vv`    Sets the level of detail (default: false) - supports multiple
    - `--remove, -r`          Removes instances before stop (default: true)

#### Usage:

    $ azk [options] scale [options] [system] [to]

#### Example:

###### Changes node010 system instances's number to one.

```
$ azk scale node010 1
azk: ↓ scaling `node010` system from 0 to 1 instances...

┌───┬─────────┬───────────┬───────────────────────────┬─────────────────┬──────────────┐
│   │ System  │ Instances │ Hostname/url              │ Instances-Ports │ Provisioned  │
├───┼─────────┼───────────┼───────────────────────────┼─────────────────┼──────────────┤
│ ↑ │ node010 │ 1         │ http://node010.dev.azk.io │ 1-http:49173    │ 2 months ago │
└───┴─────────┴───────────┴───────────────────────────┴─────────────────┴──────────────┘
```

--------------

###### Changes node010 system instances's number to 8.

```
$ azk scale node010 8
azk: ↑ scaling `node010` system from 1 to 8 instances...
azk: ✓ checking `library/node:0.10` image...
azk: ◴ waiting start `node010` system, try connect port http/tcp...
azk: ◴ waiting start `node010` system, try connect port http/tcp...

┌───┬─────────┬───────────┬───────────────────────────┬────────────────────────────┬──────────────┐
│   │ System  │ Instances │ Hostname/url              │ Instances-Ports            │ Provisioned  │
├───┼─────────┼───────────┼───────────────────────────┼────────────────────────────┼──────────────┤
│ ↑ │ node010 │ 8         │ http://node010.dev.azk.io │ 8-http:49218, 7-http:49217 │ 2 months ago │
│   │         │           │                           │ 6-http:49216, 5-http:49215 │              │
│   │         │           │                           │ 4-http:49214, 3-http:49213 │              │
│   │         │           │                           │ 2-http:49212, 1-http:49211 │              │
│   │         │           │                           │                            │              │
└───┴─────────┴───────────┴───────────────────────────┴────────────────────────────┴──────────────┘

```
Each time the user access http://node010.dev.azk.io he will be redirected to one of _node010 system 8 instances_ by `azk`'s _load balancer_.
