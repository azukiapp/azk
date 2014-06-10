# ![azk](https://github.com/azukiapp/azk/raw/master/src/share/pres/top-logo-wo.png)

`azk` is a tool that assists web developers in the creation, maintenance and isolation of development environments through automation. By installing some components (`cli` and `agent`), you will be able to easily and quickly create isolated environments to many projects in almost any development stack. Automation happens by the use of simple scripts and images.

## Main features

* Images: via Docker Index or custom inline or file scripts
* Built in load-balancer
* Built in file sync
* Automatic start-up (and reload) script
* Logging

Works on Linux & Mac OS X (requires 64 bit platform in both cases)

## Installation

### Requirements

* Linux or Mac OS X (requires 64 bit platform in both cases) (Windows: planned)
* git, curl, bash
* Internet connection (to download images)

#### Linux

On linux it's not necessary to use VirtualBox. `azk` runs directly on Docker:

* [Docker][docker], version 0.10.0.

#### Mac OS X

Only on Mac OS X it is necessary to install Virtualbox and an extra tool for file synchronization:

* [VirtualBox][virtualbox_dl], version 4.3.6+ (VMware: planned)
* unfs3 (to share files between your machine and the virtual machine)

Using [Homebrew Cask][homebrew_cask]? It makes installing VirtualBox super easy!

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
$ azk agent start --daemon        # Starts azk agent in background
$ azk agent status                # Shows azk agent status
$ azk agent stop                  # Stops azk agent

# Create initial Azkfile.js
$ azk init [project_path] 

# Run a shell in instances context
$ azk shell                       # Runs shell in default system
$ azk shell -c "ls -l /"          # Runs specific command
$ azk shell -m ~/:/azk/user       # Running with aditional mounting

# Run a shell in arbitrary image
$ azk shell -i busybox            # Runs a shell in arbitrary imagem

# Run background systems (Azkfie.js#systems)
$ azk start                       # Starts a default system
$ azk stop                        # Stops specific service
$ azk status                      # Displays all systems statuses
$ azk status --all                # Displays systems statuses including dead instances
$ azk status --instances          # Displays systems statuses including instances details
$ azk stop -s [system_name]       # Stops specific system by name
$ azk scale -s [system_name] -n 5 # Starts 5 instances of specific system
```

## Test (for experts only)

Note that running these tests requires you to have `azk agent` running.

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
