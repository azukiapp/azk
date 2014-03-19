# ![azk](https://github.com/azukiapp/azk/raw/master/lib/share/pres/top-logo-wo.png)

`azk` is a tool that assists web developers in the creation, maintenance and isolation of development environments. Through the installation of some components (`cli` and `agent`), you will be able to easily create isolated environments to many projects using several different stacks.

## Main features

* Provisioning: with custom recipes and scripts
* Builtin load-balancer
* Monitoring
* Builtin file sync
* Automatic start-up (and reload) script
* Logging

Works on Linux & MacOS (require 64 bit platform)

## How It Works

At the high level, `azk` is a command line tool that uses a given configuration file (`azkfile.json`) to define the necessary steps to build (installation and configuration) the proper environment to executing and/or compiling a given application.

Besides, it features several commands that allow for executing these tasks and controlling the execution of services related to the application, such as databases and queues. 

At the low level, `azk` is a tool that leverages a container system for Linux called [Docker][docker] in order to create isolated environments for executing all the different parts of an application. 

`azk` is able to perform these jobs through calls to the Docker API. That way, `azk` is capable of provisioning images as well as of controlling the execution of services based on these images. Beyond that, `azk` is also capable of broader tasks such as: balancing HTTP calls to instances of an application, storing execution and resources usage logs and other general tasks related to the lifecycle management of an application since its development.

### Understanding the CLI

For most tasks, the `azk` command first tries to ascertain if the current folder corresponds to an `azk app`. To do that, it verifies the presence of the `azkfile.json` file in the application's directory tree. 

Once the `azk app` is deemed valid, the `azk` command searches for `azk agent`, which will be responsible for executing the `azk command` in an environment that's isolated from the main machine. 

### Understanding azk-agent

`azk agent` can be described as the service responsible for executing `azk` commands in an isolated environment by making use of the containers system. At its deepest level, `azk agent` is a virtual machine running [debian2docker][debian2docker] over VirtualBox (support to VMware is in the roadmap).

### Understanding disk mapping

Since `azk agent` runs over a virtual machine, it is necessary to share the host machine's disk with that virtual machine.

That's why azk has a built-in a file server [p9fs][p9fs]. This server only runs with user permission and must only affect the communication interface with VirtualBox (and thus avoid security problems).

## Installation

The entire process of provisioning and configuring the environment in which the applications will be executed happens within a virtual machine.

### Requirements

* Linux (x86_64 only) or Mac OS X (Windows: planned)
* git, curl
* [VirtualBox][virtualbox_dl], version 4.3.6+ (VMware: planned)
* Internet connection (for the provisioning process)

Use [Homebrew Cask][homebrew_cask]? For VirtualBox, too easy!

```sh
brew cask install virtualbox --appdir=/Applications
```

### Basic GitHub Checkout

1. Check out ask into `~/.azk`.

  ```bash
  $ git clone -b stable https://github.com/azukiapp/azk.git ~/.azk
  ```

2. Configure azk-agent IP address

  In order to give `azk` access to `azk agent`, it is necessary to define an IP address to the virtual machine. This IP address will be used to establish a private network between the physical machine running `azk` and the virtual machine where `azk agent` is in execution. 

  ```bash
  $ echo '192.168.115.4 azk-agent' | sudo tee -a /etc/hosts 
  ```

3. Add `~/.azk/bin` to your $PATH for access to the ask command-line utility.

  ```bash
  $ echo 'export PATH="$HOME/.azk/bin:$PATH"' >> ~/.bash_profile
  # and reload
  $ source ~/.bash_profile
  ```

  **Ubuntu Desktop note**: Modify your `~/.bashrc` instead of `~/.bash_profile`.

  **Zsh note**: Modify your `~/.zshrc` file instead of `~/.bash_profile`.

4. Install depedencies and configure vm (will download ~130MB):

	```bash
	$ azk configure
	```

5. Run `azk-agent` in a terminal (daemon mode soon):

	```bash
	$ azk agent start -D
	```

6. Enjoy

  ```bash
  $ azk help
  ```

## Update

```bash
$ cd ~/.azk
$ azk agent stop
$ azk update
$ azk agent start
```

## Test

Note that running the tests requires you to be with `azk agent` running.

```bash
$ cd ~/.azk
$ azk nvm install
$ make
```

## Usage/Features

```bash
# Create initial azkfile.json
$ azk init [--box "azukiapp/ruby-box#stable"] [project_path] 

# Run a specific command
$ azk exec -i /bin/bash           # Run bash (interactive mode)
$ azk exec /bin/bash --version    # Show the version bash installed in image-app

# Run a background services (azkfile.json#services)
$ azk service start -n 5          # Start 5 instances of default service
$ azk service worker start -n 5   # Start 5 instances of woker service
$ azk service worker scale -n 10  # Scale to 10 instances of woker service
$ azk service stop azk_id         # Stop specific service process id
$ azk service stop                # Stop all default service processes
$ azk service restart azk_id      # Restart specific process
$ azk service restart all         # Hard Restart all default service proccesses
$ azk service redis restart       # Restart redis service
$ azk ps                          # Display all processes status
```

## License

"Azuki", "Azk" and the Azuki logo are copyright (c) 2013 Azuki Serviços de Internet LTDA.

Azk source code is released under Apache 2 License.

Check LEGAL and LICENSE files for more information.

[docker]: http://docker.io
[debian2docker]: https://github.com/unclejack/debian2docker
[p9fs]: https://github.com/azukiapp/node-p9fs
[virtualbox_dl]: http://www.vagrantup.com/downloads.html
[homebrew_cask]: https://github.com/phinze/homebrew-cask