# ![azk](https://github.com/azukiapp/azk/raw/master/src/pres/top-logo-wo.png)

`azk` is a tool that assists web developers in the creation, maintenance and isolation of development environments through automation. You will be able to easily and quickly create isolated environments to many projects in almost any development stack. Automation happens by the use of simple scripts and images.

## Main features

* Multiplatform: Works on Linux & Mac OS X (requires 64 bit platform in both cases)
* Images: via [Docker Registry][docker_registry]
* Built in load-balancer
* Built in file sync
* Automatic start-up (and reload) script
* Logging
* And simple and easy to use DSL to describe its architecture:

<a name="full_manifest_example"/>
## Full Azkfile.js example

```js
// Adds the systems that shape your system
systems({
  'node-example': {
    // Dependent systems
    depends: ["db"],
    // More images:  http://registry.hub.docker.com
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
      domains: [ "#{system.name}.#{azk.default_domain}" ],
    },
    envs: {
      // Exports global variables
      NODE_ENV: "dev",
    },
  },

  db: {
    image: "tutum/mysql",
    mounts: {
      // Activates a persistent data folder in '/data'
      "/data": persistent("data-#{system.name}"),
    },
    ports: {
      data: "3306/tcp",
    },
    envs: {
      MYSQL_PASS: "senha",
      MYSQL_USER: "admin",
    },
    export_envs: {
      DATABASE_URL: "mysql://#{envs.MYSQL_USER}:#{envs.MYSQL_PASS}@#{net.host}:#{net.port.data}/",
    },
  },
});

// Sets a default system (to use: start, stop, status, scale)
setDefault("node-example")
```

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

## Installation

### Requirements

* Mac OS X or Linux (requires 64 bit platform) (Windows: planned)
* bash
* Internet connection

### Installation from package (recommending)

#### Mac OS X

It is necessary to install Virtualbox and an extra tool for file synchronization:

* [VirtualBox][virtualbox_dl], version 4.3.6+ (VMware: planned)

Using [Homebrew Cask][homebrew_cask]? It makes installing VirtualBox super easy!

```sh
$ brew cask install virtualbox --appdir=/Applications
```

Now the installation of `azk`:

```sh
$ brew install azukiapp/azk/azk
```

#### Linux

* Distribution (tested): Ubuntu 12.04/14.04 and Fedora20
* [Docker][docker] 1.1.0 or greater
* Not running any service in `80` and `53` ports

If you are running a service on ports `80` or/and `53` you can customize the configuration by setting the environment variable `AZK_BALANCER_PORT` and `AZK_DNS_PORT` respectively before run `azk agent start`.

After install [docker](http://docs.docker.com/installation), check if session "non-root access" in the installation doc was followed to allow access to the service docker for your user.

##### Ubuntu Trusty 14.04 (LTS) (64-bit)

Add the Azuki repository to your apt sources list, update and install the `azk` package.

```bash
$ echo "deb [trusted=yes] http://repo.azukiapp.com/azuki-trusty/ /" | sudo tee /etc/apt/sources.list.d/azk.list
$ sudo apt-get update
$ sudo apt-get azk
```

##### Ubuntu Precise 12.04 (LTS) (64-bit)

Add the Azuki repository to your apt sources list, update and install the `azk` package.

```bash
$ echo "deb [trusted=yes] http://repo.azukiapp.com/azuki-precise/ /" | sudo tee /etc/apt/sources.list.d/azk.list
$ sudo apt-get update
$ sudo apt-get azk
```

##### Fedora 20

Add Azuki package resource list file:

```bash
$ [sudo] touch /etc/yum.repos.d/azuki.repo
```

Include this line on `/etc/yum.repos.d/azuki.repo` file:

```
[azuki]
name=azk
baseurl=http://repo.azukiapp.com/azuki-fedora20/
enabled=1
gpgcheck=0
```

Update sources and install libnss-resolver, docker and azk:

```bash
$ [sudo] yum install docker-io libnss-resolver azk
```

<a name="install_from_source"/>
### Other distributions - installation from source

1. Install the dependency [libnss-resolver][libnss-resolver];

2. Check out `azk` into `~/.azk`.

  ```bash
  $ git clone -b master https://github.com/azukiapp/azk.git ~/.azk
  $ cd ~/.azk
  $ make bootstrap
  ```

3. Add `~/.azk/bin` to your $PATH for access to the `azk` command-line utility.

  ```bash
  $ echo 'export PATH="$HOME/.azk/bin:$PATH"' >> ~/.bash_profile
  # and reload
  $ source ~/.bash_profile
  ```

  **Ubuntu Desktop note**: Modify your `~/.bashrc` instead of `~/.bash_profile`.

  **Zsh note**: Modify your `~/.zshrc` file instead of `~/.bash_profile`.

4. Run `azk-agent` in a terminal:

  ```bash
  $ azk agent start
  ```

## Update from azk <= 0.5.1

Before install new version:

```bash
$ azk agent stop
$ cd ~/.azk
$ ./bin/azk nvm node -e "console.log(require('glob').sync('./\!(data)', { dot: true }).join(' '))" | xargs rm -rf
```

Now you can install new `azk` version.

## Usage/Features

```bash
# Control azk agent
$ azk agent start                 # Starts azk agent in background
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

## Contributions and testing (for experts only)

First [install azk](#install_from_source) in from the source. Now you can run the testes:

  ```bash
  $ cd ~/.azk
  $ ./bin/azk nvm grunt test
  ```
Note that running these tests requires you to have `azk agent` running.

## License

"Azuki", "Azk" and the Azuki logo are copyright (c) 2013 Azuki Serviços de Internet LTDA.

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

