## azk init

Initializes the `Azkfile.js` file based on systems contained within current folder.

#### Options:

- `--force, -f`     Replaces the `Azkfile.js` file if it already exists (default: false)

#### Usage:

    $ azk [options] init [options] [path]

#### Example:

```
$ azk init

azk init --force
azk: `node` system was detected at 'azkfile-init-examples/node010' as 'node010'
azk: `php` system was detected at 'azkfile-init-examples/phpSample' as 'phpSample'
azk: `phplaravel` system was detected at 'azkfile-init-examples/phpLaravel' as 'phpLaravel'
azk: `django` system was detected at 'azkfile-init-examples/django15' as 'django15'
```

