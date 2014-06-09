# ![azk](https://github.com/azukiapp/azk/raw/master/src/share/pres/top-logo-wo.png)

`azk` is a tool that assists web developers in the creation, maintenance and isolation of development environments. Through the installation of some components (`cli` and `agent`), you will be able to easily create isolated environments to many projects using several different stacks.

## Main features

* Images: via Docker Index or custom inline or file scripts
* Built in load-balancer
* Built in file sync
* Automatic start-up (and reload) script
* Logging

Works on Linux & MacOS (require 64 bit platform in both cases)

## Installation

The entire process of provisioning and configuring the environment in which the applications will be executed happens within a virtual machine.

### Requirements

* Linux or Mac OS X (require 64 bit platform in both cases) (Windows: planned)
* git, curl
* Internet connection (for download images)

#### Linux

In linux is not necessary to use VirtualBox, the `azk` running directly on the Docker:

* [Docker][docker], version 0.10.0.

#### Mac OS X

Only on mac installing Virtualbox and an extra tool for file synchronization is necessary:

* [VirtualBox][virtualbox_dl], version 4.3.6+ (VMware: planned)
* unfs3 (for share files between your machine and virtual machine)

Use [Homebrew Cask][homebrew_cask]? For VirtualBox, too easier!

```sh
brew cask install virtualbox --appdir=/Applications
brew install unfs3
```

### Basic GitHub Checkout

1. Check out ask into `~/.azk`.

  ```bash
  $ git clone -b stable https://github.com/azukiapp/azk.git ~/.azk
  ```
  
2. Add `~/.azk/bin` to your $PATH for access to the ask command-line utility.

  ```bash
  $ echo 'export PATH="$HOME/.azk/bin:$PATH"' >> ~/.bash_profile
  # and reload
  $ source ~/.bash_profile
  ```

  **Ubuntu Desktop note**: Modify your `~/.bashrc` instead of `~/.bash_profile`.

  **Zsh note**: Modify your `~/.zshrc` file instead of `~/.bash_profile`.

3. Install depedencies and configure vm (will download ~130MB):

	```bash
	$ azk check-install
	```

4. Run `azk-agent` in a terminal (daemon mode soon):

	```bash
	$ azk agent start
	```

5. Enjoy

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

## Usage/Features

```bash
# Control azk agent
$ azk agent start --daemon        # Start azk agent in background
$ azk agent status                # Show azk agent status
$ azk agent stop                  # Stop azk agent

# Create initial Azkfile.js
$ azk init [project_path] 

# Run a specific command in default system
$ azk exec -i /bin/bash           # Run bash (interactive mode)
$ azk exec /bin/bash --version    # Show the version bash installed in image-app

# Run a background systems (Azkfie.js#systems)
$ azk start                       # Start a default system
$ azk stop                        # Stop specific service
$ azk status                      # Display all system status
$ azk stop -s [system_name]       # Stop specific system by name
$ azk scale -s [system_name] -n 5 # Start 5 instances of specific system
```

## Test (for experts only)

Note that running the tests requires you to have `azk agent` running.

```bash
$ cd ~/.azk
$ azk nvm npm install
$ azk nvm grunt test
```

## License

"Azuki", "Azk" and the Azuki logo are copyright (c) 2013 Azuki Serviços de Internet LTDA.

Azk source code is released under Apache 2 License.

Check LEGAL and LICENSE files for more information.

[docker]: http://docker.io
[virtualbox_dl]: http://www.vagrantup.com/downloads.html
[homebrew_cask]: https://github.com/phinze/homebrew-cask
