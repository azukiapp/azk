## azk info

  Shows systems information for the current `Azkfile.js`.

#### Usage:

    azk info [<system>] [options]

#### Examples:

```
azk info
azk info web
azk info web,worker --filter=mounts,env
```

####  Options:

```
  --json                    Outputs in json format.
  --filter=<props>          Filter system properties [default: all].
  --quiet, -q               Never prompt.
  --help, -h                Shows help usage.
  --no-color                Remove colors from output
  --log=<level>, -l         Sets log level (default: error).
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].
```
