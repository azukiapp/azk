# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## dev

* Enhancements
  * [Code] Adding github issue and PR templates;
  * [Docs] The instructions for use `azk` and `Wordpress` have been improved;

## v0.17.0 - (2016-02-19)

* Enhancements
  * [Cli] `azk version` changes to display the first 7 digits of the commit hash and the date of the corresponding commite version;
  * [Cli] Updating `i18n-cli`: now, it supports color syntax highlight;
  * [Cli] Replacing `colors` for `chalk` and adding `--no-color` option that outputs in only one color;
  * [Cli] Improving `ui.isInteractive()`: now, not only the existence of a `tty` is checked but also the parameter `--quiet`;
  * [Cli] Adding support to a more verbose mode in `azk start`;
  * [Cli] More options added to the `azk config` command. Now it uses a `key-value` system. The `azk config list` subcommand shows a list of the options users can choose from;
  * [Generators] Adding suggestion to CakePHP framework;
  * [Suggestions] Adding `php artisan migrate` to Laravel PHP framework;
  * [Suggestions] Changing `postgres` version to 9.4 and env vars prefix to `POSTGRES`;
  * [Docs] Adding instructions about "Expandable Properties";
  * [Package] Installation script (`install.sh`) now supports other shells besides `bash` #583;
  * [Package] Installation script now supports Arch Linux #596;
  * [Package] Installation script now supports updating `azk` #604;
  * [Package] Moving CI test scripts into azk's source code;
  * [Crash-report] A `crash-report` system has been added. It reports `azk` internal errors that may arise during its use to the Azuki team. It first informs the user before sending the report (not sending is `opt-out`). It also  gives the option to inform an e-mail address for notifications about solutions;
  * [Tracking] The anonymous user activity tracking system is now `opt-out`. Users must accept the terms of use before starting to use `azk`.
  * [Dependency] Updating `archiver`, `crash-report-sender`, `docker-registry-downloader`, `file-async` and `inquirer`;
  * [Dependency] Updating `insight-keen-io` and fixing tracker connection to it;
  * [Dependency] Updating `lodash` and fixing use of `template` in `src/utils/index`;
  * [Manifest] Adding type to `ManifestError`, possible values: `syntax`, `logic` and `validate`;
  * [Dependency] Updating `bluebird` and fixing the use of `promisify` (now, by default, it does not support mutiple returns anymore) made through `nbind`, `ninvoke` and `nfcall`;
  * [Agent] Expanding error message in agent starting process;
  * [Dependency] Updating `azk-dev` and exchanging `babel-runtime` with `babel-polyfill`;
  * [Spec] Updating `azk-dev`: the `--slow` is no longer supported and has been replaced by the reverse option `--skip-slow`;
  * [Code] Refactoring many parts of the code to best suit the modules of the `babel> 6` system;
  * [Code] Replacing `chai` by `azk-dev/lib/chai`;
  * [Code] Adding `azk [node|npm|gulp|clingwrap|ncu]` commands in development mode (`AZK_ENV=development`);
  * [Code] Adding global dependencies: `npm-check-updates` and `clingwrap`, for manage npm packages;
  * [File sharing] Avoiding to fix the synced files permissions for all systems every time a system was started #616;
  * [Docker] Upgrading azk's VM ISO to use Docker 1.9.1;
  * [Docs] All examples of the property `command` were updated as `array` instead of `string`;
  * [Docs] Upgrading azk's TOS;

* Bug
  * [Pull] When pulling in verbose mode do not print several `undefined` anymore. Instead print Docker downloading bar provided by Docker API;
  * [Core] Converting string commands to array when a Docker image has a defined `ENTRYPOINT`;
  * [Cli] Fixing return code in `azk start [url]`;
  * [Cli] Fixing return code in `azk agent stop`;
  * [Tracking] Fix a bug that could send duplicate data (stopping sending others) to the tracker system;
  * [Specs] Fix a bug in `after` hooks, this bug has caused the end of the test process returns to `0` even when the failed tests;

## v0.16.3 - (2015-12-08)

* Enhancements
  * [Installation] Installation script (`install.sh`) now installs Docker automatically;
  * [Core] The `provision` property now is run as a single command, using `&&` as separator in the commands concatenation instead of `;` previously used.

* Bug
  * [Core] Changing the way the system command is interpreted to avoid compatibility problems with older `Azkfile` that use String for the command property vs new way using Array;
  * [Core] Fixing a bug that was showing an unexpected error message when the provision step of a system resulted in a non-zero code;

## v0.16.2 - (2015-11-17)

* Enhancements
  * [Core] Upgrading node to v0.10.40;
  * [Suggesting] Changing suggestions to suggest a command based in Array in replace of String;

* Bug
  * [Core] Fixing a bug that could generate an invalid command when `azk start` runs, making systems fail by not properly overriding the image Docker command by the custom command defined in the `Azkfile`;
  * [Generators] Fixing replace evidences in `Court`;
  * [Code] Fixing Docker-in-Docker entries in `Azkfile`;

## v0.16.1 - (2015-11-08)

* Enhancements
  * [Agent] Avoiding showing messages in a loop during agent start;
  * [Package] Adding support to Ubuntu 15.10;
  * [Package] Simplify root `Azkfile`, replacing functions for `extends` property;
  * [Package] Adding a `make` script to force `make -e` in `package` system;
  * [Package] Making `git` a suggested dependency;
  * [Core] Removing `Azkfile.js` from default exclude list of `sync` mount property;

* Bug
  * [Package] Fixing npm version check. Even manually installing a different npm version, `make` overrides it and install the correct version;

## v0.16.0 - (2015-10-28)

* Bug
  * [Suggestions] Fixed high CPU usage by sync for the Laravel suggestion.

* Enhancements
  * [VM] Adding configuration key `AZK_DOCKER_MONITOR` to enable or disable docker monitor. By default is `true` for Linux and `false` if is not Linux;
  * [Cli] Send env TERM if is interactive terminal;
  * [Cli] Added the command `azk open [system]` which opens a system URL in browser #528;
  * [Cli] Adding `deploy` command to cli;
  * [Kernel] Changing system to get `command` from image, but respect this priority for `azk shell`: shell option (`--shell`) > Azkfile.js > docker image #534;
  * [Docker] Improving Docker version verification, making it more robust;

## v0.15.0 - (2015-09-15)

* Bug
  * [Manifest] Fixing wait not support `false` value;
  * [Suggestions] Fixing `command` of php_composer suggestion;
  * [Docker] Fixing support to comments and blank lines in `.dockerignore` file during Dockerfile build;

* Enhancements
  * [Cli] Start github URLs directly on `azk start` #476;
  * [Package] `git` is an `azk` installation dependency #476;
  * [Suggestions] Upgrading elixir_phoenix suggestion to work with Phoenix v1.0.0;
  * [Docker] Checking Docker version (azk supports Docker v1.8+);
  * [Docker] Upgrading to Docker 1.8.1 and locking to use Docker Remote API 1.20;
  * [Docker] Refactoring `Docker.run` to use new Docker Remote API;
  * [kernel] Separating development environment to be enabled with a single env var
  * [VM] Changing the default VM memory amount to be 1/6 of the available in the host
  * [Manifest] Adding `env` as a manifest system template;
  * [Manifest] Improving how azk handles multiple `http.domains` set by env vars;

* Deprecations
  * [Manifest] `docker_extra.start` and `docker_extra.create` is no longer supported, now you must use the container creation options directly, check in: https://docs.docker.com/reference/api/docker_remote_api_v1.20/#create-a-container;

## v0.14.6 - (2015-08-20)

* Bug
  * [Docker] Do not try to stop or kill a not running container;
  * [VM] Fixing start in Virtual Box 5.0;
  * [Suggesting] Fixing relative paths;

* Enhancements
  * [Docker] Adding docker version lock;
  * [VM] Fixing removal of VM without net interface;

* Enhancements
  * [Scale] Adding flag `--no-remove` to start command;

## v0.14.5 - (2015-08-01)

* Bug
  * [Agent] Fixing bug on Docker check that caused high CPU usage;

* Enhancements
  * [Code] Improving packaging tests;

## v0.14.4 - (2015-06-26)

* Bug
  * [Suggesting] Fixed PostgreSQL suggestion mounts path;
  * [Suggesting] Fixed the order in which the suggestion creates systems in `Azkfile.js`: applications comes first and database after;
  * [Suggesting] Fixed `Court` logic: now it doesn't investigate subfolders if evidences are found in the root folder;
  * [Agent] Replacing periodic agent check from VM to Docker;

* Enhancements
  * [Suggesting] Adding support to use `app.dir` in templates;
  * [Suggesting] Refactored suggestions for cleaner code;

## v0.14.3 - (2015-06-19)

* Bug
  * [Sync] Fixing sync excluded folders based on mount value instead of relative dir of sync;
  * [Tracking] Updating `insight-keen-io`, which was changed to use `child_process.spaw` instead of `child_process.fork`, ensuring sending the tracker data in background.

## v0.14.2 - (2015-06-18)

* Bug
  * [Agent] Fixing agent error handlers
  * [Kernel] Adds current `azk` bin folder to the PATH

* Enhancements
 * [Kernel] Removing unused dependencies

## v0.14.1 - (2015-06-17)

* Bug
  * [Agent] Fixing agent start progress in daemon mode

## v0.14.0 - (2015-06-16)

* Bug
  * [Cli] Fixing `start` (or `restart`) just opens the default system;

* Enhancements
  * [Code] Replaced Promises: Q with bluebird #386;
  * [Code] Replaced `q-io/fs` with `utils/file_async` a bluebird promisified `fs-extra` #386;
  * [Code] No more direct call to Q or any other Promise lib, only by `utils/promises` #386;
  * [Code] Removed `progress()` Promises helper. Included postal: subscribe and publish functions #385;
  * [Code] Removing `async`, `defer`, `publish`, `subscribe` and `asyncUnsubscribe` from `azk` module;
  * [Code] Using file-async npm lib
  * [Code] Removing fs-extra dependency
  * [Cli] Replacing `cli` to [`cli-router`](https://github.com/azukiapp/cli-router), #382 #418 #259;
  * [Cli] Adding scripts to bash completion, #171;
  * [Agent] The start process of the "agent" was redesigned to become safer and less complex. The code responsible for starting it in the background has been moved to the ./bin/bash;
  * [Suggesting] Now node.js suggestions have a env `PORT` for to get a `HTTP_PORT`, this change makes this suggestion more "compatible" with most of the apps that await env `PORT`.
  * [Suggesting] Refactor Rule and Suggestion base class;
  * [Suggesting] Removing (trim) multiple new_line before generate a new Manifestfile;
  * [Suggesting] Adding `elixir` suggestions;
  * [Suggesting] Adding `elixir_phoenix` suggestions;

## v0.13.1 - (2015-30-05)

* Bug
  * [Imagens] Fixing registry download error #407
  * [File sharing] Fixing bug when trying to capture the version of rsync.
  * [File sharing] Adding support to exclude files from sync through the files `.syncignore` and `.gitignore`
  * [Docker] Fixing bug that could prevent the instruction `ADD . /folder/` to work properly when used in a Dockerfile;

* Enhancements
  * [Docker] Now support `Dockerfile` is complete, and similar to the docker, including support `.dockerignore`;
  * [Suggesting] Changing the suggestions of Python/Django, Ruby and Rails to give preference to sync instead of path;

## v0.13.0 - (2015-27-05)

* Bug
  * [cli] Fixing `--mount` option of `azk shell` command to comply with Docker's pattern (`local_folder:remote_folder`);
  * [Docker] Fixing parse invalid instructions in build a Dockerfile, #391;
  * [Tracking] Fixing timeout message when tracking an event;

* Enhancements
  * [Test] Adding flag `--no-required-agent` to disable required `Agent` before tests;
  * [File sharing] Adding support to file sync instead of VirtualBox shared folders, #379;
  * [Kernel] Adding initial code of the module utils.postal and specs, #385;

## v0.12.1 - (2015-25-04)

* Bug
  * [Agent] Fixing issue between `azk` and `insight-keen-io` that prevented `azk agent` to stop;
  * [Agent] Replacing `is-online` lib with `connectivity`, #368
  * [Agent] Better `azk agent start` messages on no internet is available, #371;

* Enhancements
  * [Code] Improvements in packages scripting: now with more options and better error handling;

## v0.12.0 - (2015-16-04)

* Bug
  * [Dockerfile] Fixing `azk build` does not support `COPY` in Dockerfile, issue #341;
  * [Docker] Fixing flag `--pull` to force pull of docker image not working`;

* Enhancements
  * [Code] Replacing [`traceur`](https://github.com/google/traceur-compiler) with [`babel`](https://babeljs.io/) for transpiling JS files from ES6 to ES5 (Node.js limitation).
  * [Code] Replacing the task system grunt at gulp;
  * [Kernel] Moving `i18n` module to a npm package;
  * [Docker] Check and show error message in the pull of docker images, #299;
  * [Tracking] Ask user if he accept to be anonymously tracked; Send anonymously info to keen-io; New command `azk config track-status` to see and `azk config track-toggle` to change tracking status;
  * [Installation] Installation script (`install.sh`) now disables dnsmasq;
  * [Systems] Distinguish azk error from sub-system log error;

## v0.11.0 - (2015-25-03)

* Bug
  * [Manifest] Fixing running azk command in subfolder using dockfile, issue #250;
  * [Agent] Fixing agent does not start when not connected to internet. #312;
  * [Cli] Checking namservers every time you start a container;
  * [Dockerfile] Fixing does not show the error when the Dockerfile doesn't build, issue #303;
  * [Agent] Adding support to swap in order to endure heavy load memory cases;
  * [Agent] Changing dhcp-client configs (adding timeout) in order to avoid network-dependent services tree to fail;
  * [Agent] Making VirtualBox data disk detach/remove process more reliable;
  * [Agent] Now `azk agent stop` waits for agent real stop;
  * [Balancer] Fixing conflict at the port to be expected by the wait, issue #309;
  * [Agent] Fixing bug that could cause DNS and HTTP Balancer ports configuration to be ignored;

* Enhancements
  * [code] Adding support to "integration testing"
  * [Cli] New output when pulling images: show total layers count to download. Shows only a single progress bar with total download status. Integrate docker-registry-downloader with azk. #234 #119 #317
  * [Package] Adding update npm after installing node;
  * [Package] Fixing of usage npm-sheringwrap in package
  * [Cli] New output when pulling images: showing total counter and size of layers to be downloaded.. Shows only a single progress bar with total download status. Integrate docker-registry-downloader with azk. #234 #119;
  * [Package] Fixing usage of npm-sheringwrap in package;
  * [Agent] Using VM static ip (set via guestproperty) instead of VirtualBox DHCP servers;
  * [Agent] Adding verification of ip conflicts with existing networks interfaces;
  * [Agent] Suggesting an alternative ip in case of conflict;
  * [Agent] Adding tests to verify DNS port exchange between Agent instances and rewrite `/etc/resolver/dev.azk.io` file;
  * [Cli] Adding `manifest_id` on return of the command `azk info`, issue #323

## v0.10.2 - (2015-24-02)

* Bug
  * [Package] Force permissions to azk/bin in package

## v0.10.1 - (2015-23-02)

* Bug
  * [Cli] Fixing timeout errors to show default values on retry and timeout
  * [Systems] Fixing parse a public port in Azkfile.js
  * [Agent] Fixing umask in shared folder, replacing automount with script

## v0.10.0 - (2015-23-02)

* Bug
  * [Cli] Showing `azk`'s timeout errors #217 #268
  * [Generators] Notifying when runtime system version was unidentified.
  * [Generators] Including not found node.js suggestions #276.
  * [Agent] We changed `azk` to use `debian2docker` instead of `boot2docker`. With `debian2docker` we have the entire Virtual Box Guest Additions installed and this should fix time sync problems.

* Enhancements
  * [Agent] Adding `--force` option to `azk vm remove`. It's useful when `azk vm remove` doesn't work properly due to some unknown problem.
  * [Cli] Added message logs to `azk shell` command. Now, when `azk` is downloading the requested image it doesn't seem to be frozen anymore. To prevent those logs use the `--silent` option. It's useful when using the `-c` option and the output is used as input to another command using the pipe `|` operator.
  * [System] Adding support to customize DNS servers to will be used in system. #273
  * [Manifest] Adding `extends` support.
  * [Cli] Updated messages in locales/en-US for easier understanding
  * [File sharing] "VirtualBox Shared Folder" is the default and the only option for file sharing on OS X. The `unfs3` option was removed due its unstable behaviour.
  * [Agent] After failing in the initialization of VM is a screenshot for debugging will be saved and the path displayed to the user.

## v0.9.2 - (2015-29-01)

* Bug
  * [Generators] Fixing php suggestions.

## v0.9.1 - (2015-27-01)

* Bug
  * [Agent] Fixing http balancer error.

## v0.9.0 - (2015-27-01)

* Bug
  * [Kernel] Replacing `azk.dev` for `dev.azk.io` to improve compatibility with browsers

* Enhancements
  * [Manifest] Add **Dockerfile** support
  * [Agent] We now have self routines performed AZK update for changes in the installation and configuration of it.
  * [Cli] Add `--rebuild` and `--pull` options for the `azk start` or `azk restart` commands. It forces rebuild or image pulling and reprovision before start an instance (default: false).
  * [Cli] Added support to hide the help command options
  * [Cli] Adding option `--quiet` to support `non-interactive` mode in commands.
  * [Cli] Correcting help on quiet and verbose #226
  * [Cli] Showing azk in lowercase at azk version command #222
  * [Cli] Sorting commands on azk --help #223
  * [Generators] Updating suggestions, #224 #218

## v0.8.3

* Enhancements
  * Adding support `--text` option to show more "clean" `azk status`

* Bug
  * Fixing downloading requireds keys to connect docker.
  * Fixing option --open in command `start/restart` not null.

## v0.8.0

* Enhancements
  * [Docker] Upgrading azk.iso and azk to support Docker 1.3
  * [CI] configuring Wercker service to run all tests whenever there is a commit on master branch.
  * [Cli] Adding `--open` option in `start/restart`.
  * [Cli] Now the status of ui supports error object.
  * [Manifest] Adding `azk.version` to use in template.

* Bug
  * When an error occurs in `azk start/restart` all instances are stopped.

## v0.7.1 - (2014-01-12)

* Enhancements
  * [Generators] Improving Python generators to detect and support Django and SimpleHttpServers systems. Now Django will choose correct python version Docker image.
  * [Generators] Create PHP generators to detect and support systems with composer and laravel. Used official azuki images of docker with [`php-apache:5.5/5.6`](https://registry.hub.docker.com/u/azukiapp/php-apache/), both with apache and composer.
  * [Cli] Better message when `azk` find systems with `azk init`

* Bug
  * [Generators] Fixing slow generators;
  * [Generators] Fixing port name sugestion;
  * [Generators] Fixing mounts subfolders in a multi-system;

## v0.7.0 - (2014-18-11)

* Enhancements
  * [Generators] Adding new generators to `azk init`: Node.js 0.10, Python 3.4, jRuby 1.7, Rails 4.1, Ruby 1.9, Ruby 2.0, Ruby 2.1, Mysql 5.6 and Postgres 9.3;

* Bug
  * [Manifest] Fixing bug that prevented the start for systems with `scalable: {default: 0}`;
  * [Cli] Correcting the restart command to use the current number of instances;
  * [Cli] Fixing doctor command, get agent configs if is running;
  * [Agent] Fixing if current directory is removed before stop agent;
  * [Manifest] Fixing `wait` option, was `retry` and `timeout` inverted;
  * [Agent] Fixing search paths for 'unfs3' in Mac OS X;

## v0.6.1 - (2014-04-11)

* Enhancements
  * [Cli] Now stacktrace show the `/AZK_[version]/` for transpiled files paths in errors;

* Bug
  * [Docker] Fixing a bug if docker return a invalid json in image download;

* Deprecations
  * [Manifest] `mount_folders` and `persistent_folders` is no longer supported. ;

## v0.6.0 - (2014-30-10)

* Enhancements
  * [Manifest] Replacing `mount_folders` and `persistent_folders` with `mounts`;
  * [Manifest] Replacing `http.hostname` with `http.domains` to support multiples alias;
  * [Manifest] Show depracations warnings;
  * [Manifest] Now support `scalable.limit` to set max instances of the systems;
  * [Cli] Refactoring `bin/azk` to simplify `azk` execution;
  * [Agent] Moving `bin/azk` checks to agent start process;
  * [Agent] Warn when using an old `azk` version;
  * [Agent] Improve agent checks before starting;
  * [Code] Adding Makefile with `bootstrap` and `package_*` targets;
  * [Code] Upgrading `traceur` and removing transpiled files from `lib/azk`;
  * [Install] Replacing install by source with `brew` formula in Mac OS X;
  * [Install] Replacing install by source with packages in Ubuntu and Fedora;
  * [Docker] Upgrading to v1.2.0;

## v0.5.1 - (2014-11-10)

* Bug
  * [Cmds] Fixing stop all systems, if a dependencie system is down;

* Enhancements
  * [Manifest] Adding support `retry` and `timeout` in wait option;
  * [Agent] Adding support to configure `memory` and `cpus` with envs `AZK_VM_MEMORY` and `AZK_VM_CPUS`;

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
  * [Kernel] You can now use the AZK to test and develop the AZK for Linux (see Azkfile.js).
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
  * [Cmds] Removing `-i` and `--instances` in scale command, now use `scale [system_name,...] [number_of_instances]`.
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
