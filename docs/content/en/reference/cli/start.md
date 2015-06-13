## azk start

  Starts one or more systems.

#### Usage:

    $ azk start [<system>] [options]

#### Arguments:

  system                    System name where the action will take place.

#### Options:

  --reprovision, -R         Forces provisioning actions before starting an instance.
  --rebuild, -B             Forces rebuilding or pull image and reprovision system before starting an instance.
  --open, -o                Opens system URL in default browser application.
  --open-with=<app>, -a     Opens system URL in specified browser application.
  --quiet, -q               Never prompt.
  --help, -h                Shows help usage.
  --log=<level>, -l         Sets log level (default: error).
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].

#### Example:

```bash
# start the azkdemo system and opens the default browser
$ azk start azkdemo --open
```
