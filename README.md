# ![azk](https://raw.githubusercontent.com/azukiapp/azk/master/src/pres/top-logo-wo.png)

`azk` is a tool that assists web developers in the creation, maintenance and isolation of development environments through automation. You will be able to easily and quickly create isolated environments to many projects in almost any development stack. Automation happens by the use of simple scripts and images.

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/azukiapp/azk?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![wercker status](https://app.wercker.com/status/c771315d3c499dec99c49f49e8d1d84a/s/master "wercker status")](https://app.wercker.com/project/bykey/c771315d3c499dec99c49f49e8d1d84a) [![Code Climate](https://codeclimate.com/github/azukiapp/azk/badges/gpa.svg)](https://codeclimate.com/github/azukiapp/azk)

## Main features

* Multiplatform: Works on Linux & Mac OS X (requires 64 bit platform in both cases)
* Images: via [Docker Registry][docker_registry]
* Built in load-balancer
* Built in file sync
* Automatic start-up (and reload) script
* Logging
* And simple and easy to use DSL to describe its architecture:

## Documentation

You can find our documentation online at: http://docs.azk.io/

If you'd like to contribute:

1. Go to https://github.com/azukiapp/azk/tree/develop/docs
2. Follow the instructions in the README
3. You're awesome :)

## Quick start

### Installation

The `azk` installation  is very simple. We also have Linux and Mac packages.
For installation instructions and update, see the [en](http://docs.azk.io/en) or [pt-br](http://docs.azk.io/pt-BR).

### Basic Vocabulary

#### System of Systems

`azk` is based on the concept of [System of Systems][sos]. Accordingly, applications (your code), services and workers (such as databases, webservers and queue systems) are treated as systems that communicate with each other and together make the primary system. Using this paradigm, `azk` installs and manages development environments. While this may seem overkill at first, it actually makes it a lot easier to manage the development and execution environments of an application (in its parts - the "systems" - or in its entirety - the full "system of systems").

#### Images

In order to automate the provisioning of development environments, `azk` uses pre-built custom images. These images follow the [Docker][docker] standard and can be found in: [Docker Index][docker_index] or [Dockerfile][dockerfile].

#### Azkfile.js

`Azkfile.js` files are the cornerstone of how to use `azk`. These simple manifest files describe the systems that make your system of systems as well as the images used in their execution. They also describe parameters and execution options.

More information [here](http://docs.azk.io/en/azkfilejs/README.html).

### Starting a new application project:

If you are starting a new application project, you can already use `azk` to obtain the proper runtime as well the corresponding generators for your chosen language and then generate the application's basic structure. An example in node.js would look like this:

```bash
$ cd ~/projects
$ azk shell --image dockerfile/node # obtaining the runtime
    # mkdir app-name
    # npm init                      # building the application's basic structure
    ...
    # exit
$ cd app-name
$ azk init
azk: `node` system was detected at 'app-name'
azk: 'Azkfile.js' generated

$ azk start
```

### Taming an existing application project's development environment with `azk`:

When you already have an application project going on and want to use `azk` to streamline its development environment, all you have to do is as follows:

```bash
$ cd [my_application_folder]
$ azk init
azk: 'Azkfile.js' generated
...
$ azk start
```

## Usage/Features

```bash
# Control azk agent
$ azk agent start                 # Starts azk agent in background
$ azk agent status                # Shows azk agent status
$ azk agent stop                  # Stops azk agent

# Generate initial Azkfile.js
$ azk init [project_path]

# Run a shell in instances context
$ azk shell                       # Runs shell in default system
$ azk shell -c "ls -l /"          # Runs specific command
$ azk shell -m ~/:/azk/user       # Running with aditional mounting

# Run a shell in arbitrary image
$ azk shell -i busybox            # Runs a shell in arbitrary imagem

# Run background systems (Azkfie.js#systems)
$ azk start                       # Starts all systems
$ azk start [system_name,...]     # Starts specific systems
$ azk stop                        # Stops specific service
$ azk status                      # Displays all systems statuses
$ azk stop [system_name,...]      # Stops specific systems by names
$ azk scale [system_name,...] 5   # Starts 5 instances of specific systems
$ azk restart [system_name,...]   # Restarts a systems
$ azk restart --reprovision       # Restarts a systems and reload provision

# View logs
$ azk logs                        # Shows last lines for all systems
$ azk logs [system_name, ...]     # Shows last lines of a specific system
$ azk logs -f                     # Shows last lines of log and follow for more
```

## Contributions and testing (for experts only)

Clone `azk` from the source, and install dependencies:

  ```bash
  $ git clone https://github.com/azukiapp/azk
  $ cd azk
  $ make
  $ azk nvm grunt vm-download # MAC OS X only
  $ azk agent start
  $ azk nvm grunt test
  ```

Note that running these tests requires you to have `azk agent` running.

To run test with filters run use `azk nvm grunt --grep "test name"`:

Example:

  ```bash
  $ azk nvm grunt --grep "Azk generator"
  ```

## License

"Azuki", "Azk" and the Azuki logo are copyright (c) 2013-2015 Azuki Serviços de Internet LTDA.

Azk source code is released under Apache 2 License.

Check LEGAL and LICENSE files for more information.

[sos]: http://en.wikipedia.org/wiki/System_of_systems
[docker]: http://docker.io
[docker_index]: http://index.docker.io
[dockerfile]: http://dockerfile.github.io
[docker_registry]: http://registry.hub.docker.com
[virtualbox_dl]: http://www.vagrantup.com/downloads.html
[homebrew_cask]: https://github.com/phinze/homebrew-cask
[libnss-resolver]: https://github.com/azukiapp/libnss-resolver
