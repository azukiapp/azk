## azk restart

Stop all instances of the specified systems in the current `Azkfile.js`, or the one specified, and starts them again. Maintains the current number of instances, however, if an error occurs during reboot, all systems will be stopped.

#### Options:

- `--verbose, -v, -vv`    Increases the amount of details shown (default: false) - supports multiple
- `--reprovision, -R`     Forces reprovisioning before restarting the instance(s) of the system(s) (default: false)
- `--rebuild, --pull`     Forces _build_ or _pull_, according to the system _provider_. (default: false)

#### Usage:

    $ azk [options] restart [options] [system]

#### Example:

```sh
$ azk restart -R node010

azk: ↓ stopping `node010` system, 2 instances...
azk: ↑ starting `node010` system, 2 new instances...
azk: ✓ checking `node:0.10` image...
azk: ↻ provisioning `node010` system...
azk: ◴ waiting start `node010` system, try connect port http/tcp...
azk: ◴ waiting start `node010` system, try connect port http/tcp...

┌───┬─────────┬────────────┬────────────────────────┬────────────────────────────┬───────────────────┐
│   │ System  │ Instances  │ Hostname               │ Instances-Ports            │ Provisioned       │
├───┼─────────┼────────────┼────────────────────────┼────────────────────────────┼───────────────────┤
│ ↑ │ node010 │ 2          │ http://node010.azk.dev │ 2-http:49166, 1-http:49165 │ a few seconds ago │
└───┴─────────┴────────────┴────────────────────────┴────────────────────────────┴───────────────────┘
```
