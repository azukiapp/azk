## azk vm

Controls the virtual machine used on Mac OS X.

#### Usage:

    $ azk [options] vm [options] {action}

_______________
### azk vm installed

Checks if the virtual machine is installed.

#### Example:

    $ azk vm installed
    azk: virtual machine is not installed, try `azk vm install`.

_______________
### azk vm start

Starts the virtual machine.

#### Example:

    $ azk vm start

_______________
### azk vm stop

Stops the virtual machine.

#### Example:

    $ azk vm stop

_______________
### azk vm status

Shows the current state of the virtual machine.

#### Example:

	$ azk vm status

_______________
### azk vm ssh

Gets access to the virtual machine via SSH protocol.

#### Example:

    $ azk vm ssh

_______________
### azk vm remove

Removes the virtual machine.

#### Options:

- `--force`      Attempts to force the removal of the virtual machine. It's useful when the `remove` action doesn't work properly due to some unknown problem.

#### Examples:

##### Tries to remove the virtual machine:

    $ azk vm remove

##### Attempts to force the removal of the virtual machine:

    $ azk vm remove --force
