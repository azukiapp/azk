# Changelog

## v0.4.0-dev

* Enhancements
  * [Docker] Add command `azk docker`
  * [Vm] Adding ssh keys generator, and uploads the key to start vm.
  * [Generators] Now Generators and rules is a extension of the UI.

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
