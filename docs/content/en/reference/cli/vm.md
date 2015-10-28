## azk vm

  Controls the Virtual Machine.

#### Usage:

```
  azk vm (ssh|start|status|installed|stop|remove) [options] [-- <ssh-args>...]
```

#### Actions:

```
  installed                 Checks if the virtual machine is installed.
  remove                    Removes the virtual machine.
  start                     Starts virtual machine.
  stop                      Stops virtual machine.
  status                    Shows virtual machine status.
  ssh                       Gets access to the virtual machine via SSH protocol.
```

#### Arguments:

```
  ssh-args                  Options and arguments to be passed to VM over ssh.
```

#### Options:

```
  --force, -F               Force mode on.
  --quiet, -q               Never prompt.
  --help, -h                Shows help usage.
  --log=<level>, -l         Sets log level (default: error).
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].
```
