## azk restart

Restart works by memorizing the current status of the systems in the current `Azkfile`, stops them and then get them back online again.

If a `[system]` is specified with the command, `azk` will just restart the specified system.

To restart a system and its dependencies is necessary to pass a list of systems to be restarted: `azk restart system_dependency,system_top`.

If an error occurs during the reboot, all systems will be stopped.

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
  --no-color                Remove colors from output
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
