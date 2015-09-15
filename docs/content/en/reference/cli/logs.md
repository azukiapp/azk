## azk logs

  Shows logs for the systems.

#### Usage:

    $ azk logs [<system> <instances>] [options]

#### Arguments:

```
  system                    System name where the action will take place.
  instances                 Number of instances.
```

#### Options:

```
  --no-timestamps           Hides log timestamps.
  --follow, -f              Follows log output.
  --lines=<n>, -n           Outputs the specified number of lines at the end of logs [default: all].
  --quiet, -q               Never prompt.
  --help, -h                Shows help usage.
  --log=<level>, -l         Sets log level (default: error).
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].
```

#### Example:

```
$ azk logs azkdemo -f
azkdemo1 2015-06-12T20:10:15.703152634Z
azkdemo1 2015-06-12T20:10:15.703253658Z > azkdemo@0.0.1 start /azk/azkdemo
azkdemo1 2015-06-12T20:10:15.703278293Z > nodemon ./index.js
azkdemo1 2015-06-12T20:10:15.703296165Z
```
