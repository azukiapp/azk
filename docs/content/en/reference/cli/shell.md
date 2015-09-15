## azk shell

  Initializes a shell with the instance context, or executes an arbitrary command.

#### Usage:

    azk shell [<system>] [options] [-- <shell-args>...]

#### Arguments:

```
  system                    System name where the action will take place.
  shell-args                Options and arguments to be passed to the system.
```

#### Options:

```
  --command=<cmd>, -c       Runs the specified command.
  --cwd=<dir>, -C           Sets the current working directory.
  --image=<name>, -i        Defines the image in which the command will be executed.
  --shell=<bin>             Path to shell binary file.
  --rebuild, -B             Forces rebuilding or pull image and reprovision system before starting an instance.
  --no-remove, -r           Do not remove container instances after stopping.
  --silent                  Prevents any log message about command execution. It's useful when using the `-c` option and the output is used as input to another command using the pipe `|` operator.
  --tty, -t                 Forces pseudo-tty allocation.
  --no-tty, -T              Disables pseudo-tty allocation.
  --quiet, -q               Never prompt.
  --help, -h                Shows help usage.
  --log=<level>, -l         Sets log level (default: error).
  --mount=<paths>, -m       Additional mounting points - multiple supported (`-m ~/Home:/azk/user -m ~/data:/var/data`).
  --env=<data>, -e          Additional environment variables - multiple supported (`-e HTTP_PORT=5000 -e PORT=5000`).
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].
```

#### Examples:

```
azk shell --image azukiapp/debian --shell /bin/bash
azk shell --image azukiapp/debian --shell /bin/bash -c 'echo test'
azk shell --image azukiapp/debian --shell /bin/bash -- echo test
azk shell --mount ~/Home:/azk/user --env HOME=/azk/user --env HTTP_PORT=5000

# Starts the Azkfile.js default system using the shell /bin/bash
azk shell --shell /bin/bash

# Start the system [system_name] mounting the folder / in /azk/root
#  inside the container and setting the environment variable RAILS_ENV=dev
azk shell [system_name] --mount /:/azk/root -e RAILS_ENV=dev

# Runs the command `ls` within the system [system_name]
azk shell [system_name] -c "ls -l /"

# Start a container from the image `azukiapp/azktcl: 0.0.2` mounting
#  and running the command /bin/bash, and forcing the allocation of pseudo-tty
azk shell --image azukiapp/azktcl:0.0.2 -t -c "/bin/bash"

# Executes a command inside the container and uses its output as input to
# another command using the pipe `|` operator. Note the `--silent` option
# to prevent `azk shell` from showing any log messages in the output.
azk shell --silent -c "ls -al /" | grep home
```
