## azk start

  Starts one or more systems.

#### Usage:

```bash
$ azk start [<system>] [--reprovision --rebuild --open --open-with=<app>] [-qh] [-l=<level>] [-v]...
$ azk start [<git-repo>] [<dest-path>] [--git-ref=<git-ref>] [--reprovision --rebuild --open --open-with=<app>] [-qh] [-l=<level>] [-v]...
```

#### Arguments:

```
  system                    System name where the action will take place.
  git-repo                  Github URL to clone and start
  dest-path                 Destination path to clone project from Github
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
  --git-ref=<git-ref>       Git branch, tag or commit to clone
```

#### Example:

##### start the azkdemo system and opens the default browser

```bash
azk start azkdemo --open
```

##### start the azkdemo from Github

All examples bellow will do the same thing: clone and start `azkdemo` directly from Github on branch `final` to `/tmp/azkdemoDest` folder

```bash
# this way
azk start git@github.com:azukiapp/azkdemo.git /tmp/azkdemoDest --git-ref final

# or this way
azk start https://github.com/azukiapp/azkdemo.git /tmp/azkdemoDest --git-ref final

# or this way
azk start azukiapp/azkdemo /tmp/azkdemoDest --git-ref final

# or this way
azk start azukiapp/azkdemo#final /tmp/azkdemoDest
```
