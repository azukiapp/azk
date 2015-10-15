## azk open

  Open a system a or the default system URL in browser.

#### Usage:

```bash
$ azk open [<system>] [options]
```

#### Arguments:

```
  system                    System name where the action will take place.
```

#### Options:

```
  --open-with=<app>, -a     Opens system URL in specified browser application.
  --quiet, -q               Never prompt.
  --help, -h                Shows help usage.
  --log=<level>, -l         Sets log level (default: error).
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].
```

#### Example:

```
$ azk open
azk: Opening http://azkdemo.dev.azk.io in browser.

$ azk open azkdemo
azk: Opening http://azkdemo.dev.azk.io in browser.
```
