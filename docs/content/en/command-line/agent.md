## azk agent

Controls the `azk agent` service. This command must be executed before starting any system.

#### Usage:

    $ azk [options] agent [options] {action}

_______________
### azk agent start

Starts the `agent`.

#### Options:

- `--daemon`      starts in background mode
- `--no-daemon`   starts in foreground mode

#### Examples:

##### Start the _agent_ in _background_:

    $ azk agent start

##### Start the _agent_ in _foreground_:

    $ azk agent start --no-daemon

![Figure 1-1](../resources/images/agent_start.png)

_______________
### azk agent stop

Stop the `agent` when it's in the background.

#### Examples:

    $ azk agent stop

_______________
### azk agent status

Displays the current status of the `agent`.

#### Examples:

```
$ azk agent status
azk: Agent is running...
```
