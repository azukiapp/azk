## azk start

Starts all instances of the specified systems in the current `Azkfile.js`, or the one specified.

#### Options:

- `--verbose, -v, -vv`          Increase the level of detail (default: false) - supports multiple
- `--reprovision, -R`           Forces reprovisioning before starting the system instance (default: false)
- `--open="application", -o`    Opens the url of the standard system in the specific application (default: standard machine browser)
- `--rebuild, --pull`           Forces _build_ or _pull_, according to the system _provider_ (default: false)

#### Usage:

    $ azk [options] start [system] [options]

#### Example:

```bash
# start the node010 system and opens the default browser
$ azk start node010 --open
```