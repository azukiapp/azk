## azk help

  Shows help about a specific command.

#### Usage:

    $ azk help [<commnad>]
    $ azk [<commnad>] --help

#### Commands:

```
  agent    Controls azk agent.
  config   Controls azk configuration options.
  docker   Alias for calling docker in azk configuration scope.
  doctor   Shows an analysis of azk's health.
  info     Shows systems information for the current Azkfile.js.
  init     Initializes a project by adding Azkfile.js.
  logs     Shows logs for the systems.
  restart  Stops all systems and starts them back again.
  scale    Scales (up or down) one or more systems.
  shell    Initializes a shell context instance or runs a specified command.
  start    Starts one or more systems.
  status   Shows system(s) status.
  stop     Stops one or more systems.
  version  Shows azk version.
  vm       Controls the Virtual Machine.
```

#### Examples:

```
  azk agent --help
  azk help start
```
