## azk restart

  Stops either all instances of the systems in the current `Azkfile.js` or the one specified and starts them back again. If an error occurs during reboot, all systems will be stopped.

#### Usage:

    $ azk restart [<system>] [options]

#### Arguments:

```
  system                    System name where the action will take place.
```

#### Options:

```
  --reprovision, -R         Forces provisioning actions before starting an instance.
  --rebuild, -B             Forces rebuilding or pull image and reprovision system before starting an instance.
  --open, -o                Opens system URL in default browser application.
  --open-with=<app>, -a     Opens system URL in specified browser application.
  --quiet, -q               Never prompt.
  --help, -h                Shows help usage.
  --log=<level>, -l         Sets log level (default: error).
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].
```

#### Example:

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
