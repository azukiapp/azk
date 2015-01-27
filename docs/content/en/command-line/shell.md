## azk shell

Initializes a shell with the instance context, or executes an arbitrary command.

#### Options:

- `-T`                    Disables allocation of pseudo-tty (default: false)
- `-t`                    Force allocation of pseudo-tty (default: false)
- `--remove, --rm, -r`    Remove instances of the shell when command or shell ends (default: true) 
- `--image="", -i`        Sets the image in which the shell/command will be executed
- `--command="", -c`      Runs a specific command
- `--shell`               Path to the shell binary
- `--cwd="", -C`          Default directory
- `--mount="", -m, -mm`   Points to an additional mount (ex:./origin:/azk/target) - supports multiple
- `--env="", -e, -ee`     Additional environment variable - supports multiple
- `--verbose, -v`         Displays details about the command execution (default: false)

#### Usage:

    $ azk [options] shell [options] [system]

#### Examples:

```bash
# Starts the Azkfile.js default system using the shell /bin/bash
$ azk shell --shell /bin/bash

# Start the system [system_name] mounting the folder in /azk/root
#  inside the container and setting the environment variable RAILS_ENV=dev
$ azk shell [system_name] --mount /=/azk/root -e RAILS_ENV=dev

# Runs the command `ls` within the system [system_name]
$ azk shell [system_name] -c "ls -l /"

# Start a container from the image `azukiapp/azktcl: 0.0.2` mounting
#  and running the command /bin/bash, and forcing the allocation of pseudo-tty
$ azk shell --image azukiapp/azktcl:0.0.2 -t -c "/bin/bash"
```
