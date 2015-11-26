## azk config

Controls azk configuration options.

#### Usage:

    $ azk config (list|track-toggle|crash-report-toggle|email-set|email-never-ask-toggle) [options]

#### Actions:

```
  list                      Shows all configurations and its values
  track-toggle              Toggles tracking behavior on/off.
  crash-report-toggle         Toggles crash-report behavior on/off.
  email-set                 Set users email and save.
  email-never-ask-toggle    Toggles asking email behavior on/off.
```

#### Arguments:

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

----------

```sh
$ azk config crash-report-toggle
azk: Currently azk is automatically sending crash-reports.
? Send automatically bug reports when new errors occurs?
  1) Enable: always send error reports
  2) Disable: never send error reports
  3) Clear: clean configuration. Will ask user next time an error occurs
  Answer: 1

azk: Currently azk is automatically sending crash-reports.

# Or setting directly
$ azk config crash-report-toggle on
$ azk config crash-report-toggle off
$ azk config crash-report-toggle true
$ azk config crash-report-toggle false
$ azk config crash-report-toggle null
$ azk config crash-report-toggle undefined

```

----------

```sh
# interactively set
$ azk config email-set
azk: Current email: bar@foo.com
? What is your email [optional]? foo@bar.com
azk: Email saved: foo@bar.com

# setting directly
$ azk config email-set bar@foo.com
azk: Current email: foo@bar.com
azk: Email saved: bar@foo.com

# avoid question about email on errors
$ azk config email-never-ask-toggle false
azk: Will ask for user email: not set
azk: Will ask for user email: false
```
