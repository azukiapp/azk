## azk config

Controls azk configuration options.

#### Usage:

    $ azk config (track-toggle|track-status|bug-report-toggle|bug-report-status|email-set|email-status) [options]

#### Actions:

```
  track-toggle              Toggles tracking behavior on/off.
  track-status              Shows tracking status (on or off).
  bug-report-toggle         Toggles bug-report behavior on/off.
  bug-report-status         Shows bug-report status (on or off).
  email-set                 Set users email and save.
  email-status              Show users email.
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

----------

```sh
$ azk config bug-report-status
azk: Currently azk is automatically sending bug-reports.
```

```sh
$ azk config bug-report-toggle
azk: Currently azk is automatically sending bug-reports.
? Send automatically bug reports when new errors occurs?
  1) Enable: always send error reports
  2) Disable: never send error reports
  3) Clear: clean configuration. Will ask user next time an error occurs
  Answer: 1

azk: Currently azk is automatically sending bug-reports.

# Or setting directly
$ azk config bug-report-toggle on
$ azk config bug-report-toggle off
$ azk config bug-report-toggle true
$ azk config bug-report-toggle false
$ azk config bug-report-toggle null
$ azk config bug-report-toggle undefined

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
```


```sh
$ azk config email-status
azk: Current email: bar@foo.com
```
