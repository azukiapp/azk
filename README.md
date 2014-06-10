# ![azk](https://github.com/azukiapp/azk/raw/master/src/share/pres/top-logo-wo.png)

`azk` is a tool that assists web developers in the creation, maintenance and isolation of development environments through automation. You will be able to easily and quickly create isolated environments to many projects in almost any development stack. Automation happens by the use of simple scripts and images.

## Main features

* Images: via Docker Index or custom inline or file scripts
* Built in load-balancer
* Built in file sync
* Automatic start-up (and reload) script
* Logging

Works on Linux & Mac OS X (requires 64 bit platform in both cases)

## Quick start

### Vocabulário básico

#### System of Systems

O `azk` é baseado no conceito de [System of Systems][sos], onde aplicações, serviços e workers são tratados como sistemas que se comunicação entre si formando um sistema principal. Partindo deste pré-suposto é fácil gerenciar o ambiente de execução e desenvolvimento de qualquer sistema de forma conjuta e isolada.

#### Images

Para prover o ambiente de isolamento o `azk` utiliza-se de imagens pré construidas ou customizadas. Estas imagens sequem o padrão do Docker e podem ser econtradas em: [Docker Index][docker_index] ou [Dockerfile][dockerfile]

#### Azkfile.js

O arquivo `Azkfile.js` é a espinha dorsal do `azk`, é nele que são descritos quais os sistemas forma o seu sistema, bem como as imagens que são usadas para execução de cada um dos sistema, além de parametros e opções de execução.

[Full](#full_manifest_example) Azkfile.js example
- [Installation](#a1)

### Controlando um sistema já existente com o azk:

Se você já tem um sistema e quer utilizar o `azk` para controlar o ambiente de execução deste sistema, é simples:

```bash
$ cd [my_system_folder]
$ azk init
azk: 'Azkfile.js' generated
$ azk up
```

### Iniciando o uso do azk em um novo sistema:

Se você ainda não tem um sistema, é possível utilizar o `azk` para obter o ambiente de execução da linguagem ou framework escolhido e a partir dele gerar a estrutura básica da sua aplicação. Um exemplo em node:

```bash
$ cd ~/projects
$ azk shell --image dockerfile/node
  # mkdir app-name
  # npm init
  ...
  # exit
$ cd app-name
$ azk init
azk: 'Azkfile.js' generated
$ azk up
```

## Installation

### Requirements

* Mac OS X (requires 64 bit platform) (Linux and Windows: planned)
* git, curl, bash
* Internet connection (to download images)

It is necessary to install Virtualbox and an extra tool for file synchronization:

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
    workdir: "/azk/<%= manifest.dir %>",
    command: "node index.js",
    // Mounts folders to assigned paths
    mount_folders: {
      ".": "/azk/<%= manifest.dir %>",
    },
    // Enables http balancer over instances
    balancer: {
      // node-example.dev.azk.io
      hostname: "<%= system.name %>.<%= azk.default_domain %>",
      alias: [
        "othername.<%= azk.default_domain %>"
      ]
    },
    envs: {
      // Exports global variables
      NODE_ENV: "dev",
    }
  },
  
  db: {
    image: "dockerfile/mariadb"
    // Activates a persistent data folder in '/data'
    persistent_folders: ["/data"],
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

[sos]: http://en.wikipedia.org/wiki/System_of_systems
[docker]: http://docker.io
[docker_index]: http://index.docker.io
[dockerfile]: http://dockerfile.github.io
[virtualbox_dl]: http://www.vagrantup.com/downloads.html
[homebrew_cask]: https://github.com/phinze/homebrew-cask
