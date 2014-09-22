# ![azk](https://github.com/azukiapp/azk/raw/master/src/share/pres/top-logo-wo.png)

`azk` is a tool that assists web developers in the creation, maintenance and isolation of development environments through automation. You will be able to easily and quickly create isolated environments to many projects in almost any development stack. Automation happens by the use of simple scripts and images.

## Main features

* Images: via [Docker][docker] Index or custom inline or file scripts
* Built in load-balancer
* Built in file sync
* Automatic start-up (and reload) script
* Logging

Works on Linux & Mac OS X (requires 64 bit platform in both cases)

## Quick start

### Basic Vocabulary

#### System of Systems

`azk` is based on the concept of [System of Systems][sos]. Accordingly, applications (your code), services and workers (such as databases, webservers and queue systems) are treated as systems that communicate with each other and together make the primary system. Using this paradigm, `azk` installs and manages development environments. While this may seem overkill at first, it actually makes it a lot easier to manage the development and execution environments of an application (in its parts - the "systems" - or in its entirety - the full "system of systems").

#### Images

In order to automate the provisioning of development environments, `azk` uses pre-built custom images. These images follow the [Docker][docker] standard and can be found in: [Docker Index][docker_index] or [Dockerfile][dockerfile].

#### Azkfile.js

`Azkfile.js` files are the cornerstone of how to use `azk`. These simple manifest files describe the systems that make your system of systems as well as the images used in their execution. They also describe parameters and execution options.

[Full](#full_manifest_example) Azkfile.js example

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

## Installation from package

Coming soon...

## Installation from source

### Requirements

* Mac OS X or Linux (requires 64 bit platform) (Windows: planned)
* git, curl, bash
* Internet connection

#### Mac OS X requirements 

It is necessary to install Virtualbox and an extra tool for file synchronization:

* [VirtualBox][virtualbox_dl], version 4.3.6+ (VMware: planned)
* unfs3 (to share files between your machine and the virtual machine)

Using [Homebrew Cask][homebrew_cask]? It makes installing VirtualBox super easy!

```sh
brew cask install virtualbox --appdir=/Applications
brew install unfs3
```

#### Linux requirements

* Distribution (tested): Ubuntu 12.04/14.04 and Fedora20
* [Docker][docker] 1.1.0 or greater
* Docker non-root access: ability to run containers with your user
* [libnss-resolver][libnss-resolver]
* Not running any service in `80` and `53` ports

If you are running a service on port `80` or `53` you can customize the configuration by setting the environment variable `AZK_BALANCER_PORT` and `AZK_DNS_PORT` respectively before run `azk agent start`.

### Basic GitHub Checkout

1. Check out `azk` into `~/.azk`.

  ```bash
  $ git clone -b stable https://github.com/azukiapp/azk.git ~/.azk
  ```

2. Add `~/.azk/bin` to your $PATH for access to the `azk` command-line utility.

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

4. Run `azk-agent` in a terminal:

  ```bash
  $ azk agent start
  ```

5. Enjoy

  ```bash
  $ azk help
  ```

### Homebrew

Coming soon...

## Update

```bash
$ cd ~/.azk
$ azk agent stop
$ azk update
$ azk agent start
```

<a name="full_manifest_example"/>
## Full Azkfile.js example

```js
// Adds the systems that shape your system
systems({
  'node-example': {
    // Dependent systems
    depends: ["db"],
    // More images:  http://images.azk.io
    image: "dockerfile/nodejs",
    // Steps to execute before running instances
    provision: [
      "npm install",
    ],
    workdir: "/azk/#{manifest.dir}",
    command: "node index.js",
    mounts: {
      // Mounts folders to assigned paths
      "/azk/#{manifest.dir}": path("."),
    },
    // Start with 2 instances
    scalable: { default: 2} 
    // Set hostname to use in http balancer
    http: {
      // node-example.dev.azk.io
      hostname: "#{system.name}.#{azk.default_domain}",
    },
    envs: {
      // Exports global variables
      NODE_ENV: "dev",
    },
  },
  
  db: {
    image: "dockerfile/mariadb",
    mounts: {
      // Activates a persistent data folder in '/data'
      "/data": persistent("data"),
    },
  }
});

// Sets a default system (to use: start, stop, status, scale)
setDefault("node-example")
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
$ azk start                       # Starts all systems
$ azk start [system_name,...]     # Starts specific systems
$ azk stop                        # Stops specific service
$ azk status                      # Displays all systems statuses
$ azk stop [system_name,...]      # Stops specific systems by names
$ azk scale [system_name,...] 5   # Starts 5 instances of specific systems
$ azk restart [system_name,...]   # Restarts a systems
$ azk restart --reprovision       # Restarts a systems and reload provision
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

[sos]: http://en.wikipedia.org/wiki/System_of_systems
[docker]: http://docker.io
[docker_index]: http://index.docker.io
[dockerfile]: http://dockerfile.github.io
[virtualbox_dl]: http://www.vagrantup.com/downloads.html
[homebrew_cask]: https://github.com/phinze/homebrew-cask
[libnss-resolver]: https://github.com/azukiapp/libnss-resolver

