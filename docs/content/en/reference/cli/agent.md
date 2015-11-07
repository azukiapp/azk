## azk agent

Controls the `azk agent` service. Check out [agent documentation](../../agent/README.md) for further informations.

#### Usage:

    $ azk agent (start|status|stop) [options]

#### Actions:

```
  start                     Starts azk agent.
  status                    Shows azk agent status.
  stop                      Stops azk agent.
```

#### Options:

```
  --no-daemon               Runs `azk agent` in foreground.
  --no-reload-vm            Do not reload Virtual Machine settings.
  --quiet, -q               Never prompt.
  --help, -h                Shows help usage.
  --log=<level>, -l         Sets log level (default: error).
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].
```

#### Examples:

    $ azk agent start --no-daemon
