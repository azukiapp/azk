## azk config

Controls azk configuration options.

#### Usage:

    $ azk config (list|set|reset) [options]

#### Actions:

```
  list                      Shows all configurations and its values
  set                       Set a configuration value
  reset                     Resets all user configuration
```

#### Arguments:

For boolean config values several values are acceptable on `config-value` argument:

- *true*: on, true, 1
- *false*: off, false, 0
- *no set*: undefined, null, none, blank, reset

```
  config-value              Value to be passed to config command (on/off/null)
```

#### Options:

```
  --quiet, -q               Never prompt.
  --help, -h                Shows help usage.
  --log=<level>, -l         Sets log level (default: error).
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].
```

#### Examples:

```sh
# list all configurations
$ azk config list
{ 'user.email': undefined,
  'user.email.always_ask': undefined,
  'user.email.ask_count': undefined,
  'terms_of_use.accepted': true,
  'terms_of_use.ask_count': 1,
  'crash_reports.always_send': undefined,
  tracker_permission: undefined }

# set your email
$ azk config set user.email foo@bar.com
azk: `user.email` was set to `foo@bar.com`

# check your email
$ azk config list user.email
{ 'user.email': 'foo@bar.com' }
```
