## azk agent

Controls the `azk agent` service. This command must be executed before starting any system.

#### Usage:

    $ azk agent (start|status|stop) [options]

#### Actions:

  start                     Starts azk agent.
  status                    Shows azk agent status.
  stop                      Stops azk agent.

#### Options:

  --no-daemon               Runs `azk agent` in foreground.
  --no-reload-vm            Do not reload Virtual Machine settings.
  --quiet, -q               Never prompt.
  --help, -h                Shows help usage.
  --env=<data>, -e          Additional environment variables - multiple supported (`-e HTTP_PORT=5000 -e PORT=5000`).
  --log=<level>, -l         Sets a log level (default: error).
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].

Examples:

    $ azk agent start --no-daemon
