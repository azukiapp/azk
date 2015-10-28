## azk config

Controls azk configuration options.

#### Usage:

    $ azk config (track-toggle|track-status) [options]

#### Actions:

```
  track-toggle              Toggles tracking behavior on/off.
  track-status              Shows tracking status (on or off).
```

#### Options:

```
  --quiet, -q               Never prompt.
  --help, -h                Shows help usage.
  --log=<level>, -l         Sets log level (default: error).
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].
```

#### Examples:

```
$ azk config track-status
azk: currently azk is tracking data, more info: https://github.com/azukiapp/azk and http://docs.azk.io/en/terms-of-use
```

```
$ azk config track-status
azk: currently azk is not tracking any data
```

```
$ azk config track-toggle
azk: currently azk is tracking, more info: https://github.com/azukiapp/azk and http://docs.azk.io/en/terms-of-use
? =========================================================================
  We're constantly looking for ways to make azk better!
  May we anonymously report usage statistics to improve the tool over time?
  More info: https://github.com/azukiapp/azk & http://docs.azk.io/en/terms-of-use
 =========================================================================
(Y/n) Yes
azk: cool! Thanks for helping us make azk better :)
```
