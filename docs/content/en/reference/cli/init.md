## azk init

  Initializes a project by adding `Azkfile.js`.

#### Usage:

  $ azk init [<path>] [options]

#### Arguments:

```
  path                      Path where manifest file can be found.
```

#### Options:

```
  --filename                Shows the manifest filename.
  --force, -F               Forces rewriting if manifest file already exists.
  --no-color                Remove colors from output
  --quiet, -q               Never prompt.
  --help, -h                Shows help usage.
  --log=<level>, -l         Sets log level (default: error).
  --verbose, -v             Sets the level of detail - multiple supported (-vv == --verbose 2) [default: 0].
```

#### Example:

```
$ azk init -F

azk: [elixir-app] `A elixir` system was detected at '/path/to/elixir_app'.
azk: [elixir-app] The image suggested was `{"docker":"azukiapp/elixir"}`.

azk: [elixir-phoenix] `A elixir_phoenix` system was detected at '/path/to/elixir_phoenix'.
azk: [elixir-phoenix] The image suggested was `{"docker":"azukiapp/elixir"}`.

azk: [node012] `A node` system was detected at '/path/to/node012'.
azk: [node012] The image suggested was `{"docker":"azukiapp/node:0.12"}`.
azk: 'Azkfile.js' generated

Tip:
  Adds the `.azk` to .gitignore
  echo '.azk' >> .gitignore
```
