# Changelog

## v0.6.0 - dev

* Enhancements
  * [Manifest] Replacing `mount_folders` and `persistent_folders` for `mounts`;

## v0.5.1 - dev

## v0.5.0 - (2014-03-09)

* Bug
  * [Cmds] Fixing the passing of parameters to the docker in `adocker`.
  * [Cmds] Now when the docker or agent is finalized the `shell` is no longer blocked.
  * [Vm] In place of the forced shutdown `poweroff` now seek to use the safe shutdown with `acpipoweroff`.
  * [Cmds] Fixing bug that prevented `azk` be used offline.

* Enhancements
  * [Manifest] Adding support `docker_extra`
  * [Manifest] Adding support to 'disable' value in ports.
  * [Kernel] Now `azk` supports Linux \o/
  * [Kenrel] You can now use the AZK to test and develop the AZK for Linux (see Azkfile.js).
  * [Cmds] Now supports the `ssh escape sequence` in `shell` command.

* Deprecations
  * [Agent] Daemon option now is default.
  * [Cmds] The command `reload` is deprecated and will be removed in the future. Use `restart` in place.

## v0.4.2 (2014-20-08)

* Bug
  * [Cmds] Fixing a `cd` bug in `docker` command.

* Enhancements
  * [Cli] Adding support accumulate boolean options.
  * [Cmds] Adding support verbose mode for provision action.
  * [Cmds] Refactoring `start`, `stop`, `scale` and `reload` to show more powerfull mensagens..
  * [Cmds] Adding alias `adocker` to `azk docker`.
  * [Systems] Adding a variables `AZK_*` to expose azk environment informations.
  * [Manifest] Adding support `wait` directive in system declaration.

## v0.4.1 (2014-04-08)

* Bug
  * [Systems] Fixed a bug that could cause the command "start" failed and a wrong error message would be displayed.

## v0.4.0 (2014-04-08)

* Enhancements
  * [Docker] Add command `azk docker`
  * [Docker] Support container annotations.
  * [Vm] Adding ssh keys generator, and uploads the key to start vm.
  * [Generators] Now Generators and rules is a extension of the UI.
  * [Cmds] Removing `-s` and `--system` from `start,stop,scale,shell` commands, now use `[command] [system_name,...]`.
  * [Cmds] Removing `-i` and `--instances` in scale command, now use `scale [system_name,...] [number_of_instances].
  * [Cmds] Print startup error in `start` and `scale` commands.
  * [Cmds] Implementing the command `logs`, including support `--follow` and `--lines` options.
  * [Cmds] Implementing the command `doctor`, including support `--logo` option.

* Enhancements Manifest
  * Validate: system name format (/^[a-zA-Z0-9-]+$/).
  * Validate: image is required.
  * Validate: declared dependencies are required.
  * Validate: circular dependencies are checked.
  * Support `shell` option to specify the shell to be used from `azk shell` (default: /bin/sh)
  * Support `#{}` in replace `<%=%>`.
  * Adding scalable option.
  * Adding http option.

* Deprecations
  * [Manifest] Removing "balancer" option (use http).

## v0.3.3 (2014-07-24)

* Bug
  * [Commands] Fixing a bug in `azk status` with run a invalid instances state.

## v0.3.2 (2014-07-23)

* Bug
  * [Generators] Fixing command to use bundler in ruby generator rule.

## v0.3.1 (2014-07-11)

* Enhancements
  * [Manifest] Support `env` to use environment variables in DSL.
  * [Generators] Adding base initializar for ruby projects.

* Bug
  * [Cli] Fix generate manifest in blank project dir.
  * [Vm] Adding bindfs to fix a bug of the changing owner or group in sync files.

## v0.3.0 (2014-06-16)

* Enhancements
  * [Dns] Add dns server
  * [Cli] Add info command we show the result of analysis of Azkfile.js
  * [Doc] Adding changelog :)
  * [Docker] Adding support docker 1.0
  * [Cli] Add support "--check-install" in agent

* Bug
  * [Kernel] Now using azukiapp/azktcl in place of azukiapp/busybox
  * [Install] Now use git fetch and git merge to update code

* Deprecations
  * [Config] Removing configuration of the /etc/hosts
  * [Docker] Replacing debian2docker for boot2docker

## v0.2.0 (2014-06-10)

* Enhancements
  * [Kernel] Now using the logic of Docker images instead of the logic box
  * [Kernel] Introducing SoS
  * [Manifest] Remaking the manifest to use dsl js instead of json
  * [Code] Now using js ES6 (via traceour)

* Deprecations
  * [Kernel] Box and services is no longer supported
