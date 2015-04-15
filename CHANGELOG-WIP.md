$ git diff master --name-only

    + spec/generator/index_spec.js  ( ? )
    + spec/utils/i18n_spec.js ( ? )
    + src/generator/rules/ruby.js   ( ? )
    + src/system/run.js ( ? )

    ----------------------------------------

    + npm-shrinkwrap.json

    + package.json

    + spec/utils/tracker_spec.js
      - tests for Tracker class

    + src/cli/command.js
      - hacks `before_action` to call `after_action` after `action`

    + src/cli/tracked_cmds.js
      - implement `before_action` and `after_action` filters to better track commands

    + src/cli/helpers.js
      - implements `askPermissionToTrack` before running any commands

    + src/cli/interactive_cmds.js
      - creates a middleware called `TrackedCmds` between `InteractiveCmds` and `Command` classes to track every command

    + src/config.js
      - add the key `paths:analytics` to set Tracker data storage path
      - add `tracker` key to set Keen.io credentials

    + src/docker/docker.js
      - implements docker action hooks like `stop`, `remove` and `kill` to track container data initialized by `inspect`

    + src/docker/run.js
      - implements tracker for docker informations itself

    + src/images/index.js
      - implements tracker for images `pull` and `build` commands

    + src/system/scale.js
      - implements tracker for containers `scale` commands

     + src/utils/tracker.js
      - implements Insight-Keen-IO API communication
