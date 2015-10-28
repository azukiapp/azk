## azk deploy

  Deploy this project to a remote server.

#### Usage:

```bash
$ azk deploy (clear-cache|fast|full|restart|versions) [-vh]
$ azk deploy shell [--command=<cmd>] [-vh] [-- <args>...]
$ azk deploy ssh [-vh] [-- <args>...]
$ azk deploy rollback [<ref>] [-vh]
$ azk deploy [-vh]
```

#### Actions:

```
  clear-cache               Clears deployment cached configuration.
  fast                      Deploys without configuring the remote server (default for every run after the first deployment).
  full                      Configures the remote server and deploy the app (default for the first deployment).
  restart                   Restarts local systems or the app on the remote server.
  versions                  Lists all versions of the app deployed on the remote server.
  shell                     Starts a shell from inside the deploy system container.
  ssh                       Connects to the remote server (when used with deploy) via SSH protocol.
  rollback                  Reverts the app to a specified reference (default is the previous version).
```

#### Arguments:

```
  ref                       Version or git reference -- commit, branch etc.
```

#### Options:

```
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].
  --help, -h                Shows help usage.
  --command=<cmd>, -c       Runs the specified command.
```

#### Examples:

``` bash
$ azk deploy                                           # run `deploy fast`
$ azk deploy shell
$ azk deploy full
$ azk deploy fast
$ azk deploy versions
$ azk deploy rollback                                  # rollback to previous version
$ azk deploy rollback v2                               # rollback to version v2
$ azk deploy rollback feature/add                      # rollback to branch feature/add
$ azk deploy rollback 880d01a                          # rollback to commit 880d01a
$ azk deploy restart
```
