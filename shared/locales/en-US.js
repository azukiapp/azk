require('colors');

var version = "Shows azk version";
var verbose = "Sets the level of detail";
var systems_options = "Targets systems of action";
var reprovision = "Force the provisioning actions before starting an instance";

module.exports = {
  errors: {
    not_vm_start: "Unable to install and configure virtual machine",
    not_connect_docker: "Could not initialize balancer because Docker was not available",
    agent_not_running: "Azk agent is required but is not running (try `azk agent status`)",
    agent_start: "Azk agent start error: %(error)s",
    not_been_implemented: "This feature: `%(feature)s` has not been implemented yet",
    system_not_found: "System `%(system)s` not found in `%(manifest)s`",
    manifest_required: "Manifest is required, but was not found in `%(cwd)s`",
    manifest_error: "Manifest not valid (see http://doc.azk.io), error:\n%(err_message)s",
    required_option_error: "Option %(option)s is required",
    system_depend_error: "System `%(system)s` depends on the system `%(depend)s`",
    system_run_error: "Run system `%(system)s` return: (%(exitCode)d), for command: %(command)s:\n%(log)s",
    system_not_scalable: "System `%(system)s is not scalable only one instance is allowed.",
    image_not_available: "System `%(system)s` requires image `%(image)s` which is not avaible",
    run_command_error: "Run `%(command)s` in system `%(system)s` error:\n`%(output)s`",
    provision_pull_error: "Error downloading/pulling docker image `%(image)s`, message: %(msg)s.",
    invalid_option_error: "Invalid argument option: %(option)s",
    invalid_value_error: "Invalid value: %(value)s in option %(option)s",
    image_not_exist: "Image from '%(image)s' not found",
    provision_not_found: "Not found '%(image)s' image",
    os_not_supported: "System not supported (see http://azk.io)",

    dependencies: {
      "*": {
        upgrade: ["\nYou are using `v%(current_version)s` version.",
                  "`v%(new_version)s` version is available.",
                  "Please, access http://azk.io to upgrade\n"].join("\n")
      },
      darwin: {
        VBoxManage : 'VirtualBox not installed. Install before continue.',
        unfsd: 'unfs3 not installed. Reinstall `azk` or \`brew install unfs3\` before continuing.',
        network: 'networking error',
      },
      linux: {
        port_error: [
          "The %(port)s port configured for the `%(service)s` service is not available.",
          "Try configure a different port setting %(env)s environment variable.",
          "Check http://docs.azk.io for more information.",
        ].join('\n'),
        docker_access: [
          "Could not connect to the docker service.",
          "Check if docker service is running.",
          "And check if you have write permission to socket: '%(socket)s'",
        ].join('\n'),
      }
    }
  },

  status: {
    agent: {
      running: "Agent is running...",
      not_running: "Agent is not running (try: `azk agent start`).",
      starting: "Agent is being started...",
      already: "Agent is already running.",
      started: "Agent has been successfully started.",
      stopping: "Agent is being stopped...",
      stopped: "Agent has been successfully stopped.",
      error: "Agent starting error: %(data)s.",
      wait: "Wait, this process may take several minutes",
      progress: "progress...",
    },

    vm: {
      installing  : "Installing virtual machine...",
      installed   : "Virtual machine has been successfully installed.",
      starting    : "Starting virtual machine...",
      started     : "Virtual machine has been successfully started.",
      // TODO: stopping
      stoping     : "Stopping virtual machine...",
      // TODO: stopped
      stoped      : "Virtual machine has been successfully stopped.",
      removing    : "Removing virtual machine...",
      removed     : "Virtual machine has been successfully removed.",
      // TODO: waiting
      wait        : "Waiting for initialization of virtual machine...",
      initialized : "Virtual machine is ready to use.",
      progress    : "Trying connect to vm (%(uri)s) (%(attempts)d/%(max)d)...",
      upkey       : "Upload the ssh key to vm...",
      error       : "Error in vm process: %(data)s",
    },

    socat: {
      progress : "trying to connect to docker (%(attempts)d/%(max)d)...",
    },

    'balancer-redirect_connect': {
      progress: "Check if balancer redirect service is up (%(uri)s) (%(attempts)d/%(max)d)...",
    },

    balancer: {
      starting_memcached: "Starting memcached service...",
      started_memcached : "Memcached service started.",
      stopping_memcached: "Stopping memcached service...",
      stoped_memcached  : "Memcached service was stoped.",
      exited_memcached  : "Memcached service was `exited`.",

      starting_hipache  : "Starting http balancer service...",
      started_hipache   : "Http balancer service started.",
      stopping_hipache  : "Stopping http balancer service...",
      stoped_hipache    : "Http balancer service was stoped.",
      exited_hipache    : "Http balancer service was `exited`.",

      'starting_balancer-redirect': "Starting azk balancer redirect service...",
      'started_balancer-redirect' : "Balancer redirect started.",
      'stopping_balancer-redirect': "Stopping balancer redirect...",
      'stoped_balancer-redirect'  : "Balancer redurect was stoped.",

      starting_dns      : "Starting azk dns service...",
      started_dns       : "Dns service started.",
      stopping_dns      : "Stopping dns service...",
      stoped_dns        : "Dns service was stoped.",
      progress: "Trying connect to docker (%(uri)s) (%(attempts)d/%(max)d)...",
    },

    unsfd: {
      starting : "starting unsfd...",
      started  : "unsfd started in %(port)s port with file config: %(file)s.",
      stopping : "stopping unsfd...",
      // TODO: stopped
      stoped   : "unsfd has been successfully stopped.",
      mounting : "mounting the unsfd shared folder in virtual machine...",
      mounted  : "unsfd shared folder has been successfully mounted.",
    },
  },

  generator: {
    found: "`%(__type)s` system was detected at '%(dir)s' as '%(systemName)s'",
  },

  manifest: {
    not_found: "no such '%s' in current project",
    circular_depends: "Circular dependency between %(system1)s and %(system2)s",
    image_required: "Not image set for the `%(system)s' system",
    system_name_invalid: "The system name `%(system)s` is not valid.",
    depends_not_declared: "The `%(system)s` system depends on the `%(depend)s` system, which was not stated.",
    balancer_depreciation: "The `balancer` option used in the `%(system)s` is deprecated, use `http` and `scalable` to replace",
    invalid_default: "Unable to set the system `%(system)s` as a default because it was not declared",
    mount_and_persistent_depreciation: [
      "The `%(option)s` option used in system `%(system)s` is no longer supported.",
      "You must change the %(manifest)s to use `mounts`",
      "Check http://git.io/29JW0w for further information",
    ].join("\n"),
    validate: {
      deprecated : "The `%(option)s` used in `%(system)s` is deprecated, check the documentation for `%(new_option)s`",
      not_systems: "No system has been set yet, check the documentation",
    }
  },

  system: {
    cmd_not_set: "Command not set in system \\`%(system)s\\`",
    seelog: "See the back log",
  },

  configure: {
    loaded: "Settings loaded successfully.",
    loading_checking: "Loading settings and checking dependencies.",
    ip_question: "Enter the vm ip",
    ip_invalid: "`%(ip)s`".yellow + " is an invalid v4 ip, try again.",
    ip_of_range: "`%(ip)s`".yellow + " is an invalid ip range, try again.",
    adding_ip: "Adding %(ip)s to %(file)s ...",
    generating_key: "Generating public/private rsa key pair to connect vm.\n",
    vm_ip_msg: ([
      "",
      "In order to give `azk` access to `azk agent`,",
      "it is necessary to define an IP address to the virtual machine.",
      "This IP address will be used to establish a private network",
      "between the physical machine running `azk` and the virtual",
      "machine where `azk agent` is in execution.",
      "",
    ]).join('\n'),
    check_version: 'Checking version...',
    check_version_error: 'checking version: [ %(error_message)s ]!',
    clean_containers: "Clearing %(count)d lost containers",
  },

  commands: {
    not_found: "Command '%s' not found",
    azk: {
      description: "Azk short help",
      options: {
        command: {
          name: "command".yellow
        },
        log: "Sets a log level",
        help: "Shows this help",
        version: version,
      },
      examples: [
        '$ azk agent start --daemon',
        '$ azk shell --image azukiapp/busybox',
        '$ azk shell --mount ~/Home:/azk/user -e HOME=/azk/user',
        '$ azk status [system_name]',
        '$ azk scale [system_name] 2',
      ],
    },
    version: {
      description: version
    },
    agent: {
      description: "Controls azk agent",
      start_fail: "Agent start fail: %s",
      options: {
        action: {
          name: "actions".magenta,
          options: {
            start: "Start azk agent",
            status: "Show the azk agent status",
            stop: "Stop the azk agent running in the background",
          }
        },
        'reload-vm': "Reloads the virtual machine settings",
        daemon: "Runs azk agent in background mode",
      }
    },
    configs: {
      description: "Shows the azk configs values",
    },
    docker: {
      description: "Alias for calling the docker in 'azk' scope configurations",
    },
    doctor: {
      description: "Shows an analysis of the health of `azk`",
      options: {
        logo: "Shows the `azk` logo before show health informations",
      },
    },
    info: {
      description: "Shows systems informactions for the current `Azkfile.js`",
      options: {
        colored: "Outputs with colors",
      },
    },
    logs: {
      description: "Shows logs for the systems",
      options: {
        follow: "Follow log output",
        lines: "Output the specified number of lines at the end of logs",
        timestamps: "Show timestamps",
      },
    },
    shell: {
      description: "Initializes a shell with instance context or runs a arbitrary command",
      invalid_mount: "Invalid mount parameter: `%(value)s`, use `point:[path:|persitent:]origin`",
      invalid_env: "Invalid env variable: `%(value)s`, use `VARIABLE=VALUE`",
      options: {
        T: "Disables pseudo-tty allocation",
        t: "Forces pseudo-tty allocation",
        system  : "A system context to execute a shell or command",
        remove  : "Removes shell instances after exit shell or command",
        command : "Runs a specific command",
        shell   : "The path to shell binary",
        verbose : "Shows details about command execution",
        mount   : "Points for additional mounting (ex:./origin:/azk/target)",
        cwd     : "Default directory",
        image   : "Defines the image in which the command will be executed",
        env     : "Additional environment variables",
      },
      ended: {
        removed: "finished, because the container was removed",
        docker_end: "finished, because the docker was finalized",
        docker_notfound: "finished, because docker not found",
      },
      examples: [
        '$ azk shell --shell /bin/bash',
        '$ azk shell [system_name] --mount /=/azk/root -e RAILS_ENV=dev',
        '$ azk shell [system_name] -c "ls -l /"',
        '$ azk shell --image azukiapp/budybox -t -c "/bin/bash"',
      ]
    },
    help: {
      description: "Shows help about the specific command",
      usage: 'Usage:'.blue + ' $ %s',
      options: "options:".green,
      examples: "examples:".yellow,
    },
    helpers: {
      pull: {
        pulling: 'Pulling repository %s...',
        bar_progress: '  :title [:bar] :percent :progress',
        bar_status: '  :title :msg',
      }
    },
    init: {
      description: "Initializes a project by adding the file Azkfile.js",
      already: "'%s' already exists (try: `--force`)",
      generated: "'%s' generated",
      github: "\nTip:\n  Adds the `.azk` in .gitignore\n  echo '.azk' >> .gitignore \n",
      not_found: "Not found a system(s), generating with example system.",
      options: {
        force: "Forces the overlay file Azkfile.js",
      }
    },
    start: {
      description: "Starts an instance of the system(s)",
      already: "System `%(name)s` already started",
      options: {
        verbose: verbose,
        reprovision: reprovision,
      }
    },
    stop: {
      description: "Stops an instance of the system(s)",
      not_running: "System `%(name)s` not running",
      options: {
        verbose: verbose,
        remove: "Removes the instances before stop",
      }
    },
    scale: {
      instances   : "from " + "%(from)d".red + " to " + "%(to)d".green + " instances",
      description : "Scales (up or down) an instance of the system(s)",
      wait_port   : "◴".magenta + " waiting start `"+ "%(system)s".blue  + "` system, try connect port %(name)s/%(protocol)s...",
      check_image : "✓".cyan    + " checking `"     + "%(image)s".yellow + "` image...",
      pull_image  : "⇲".blue    + " downloading `"  + "%(image)s".yellow + "` image...",
      provision   : "↻".yellow  + " provisioning `" + "%(system)s".blue  + "` system...",
      starting    : "↑".green   + " starting `"     + "%(system)s".blue  + "` system, " + "%(to)d".green + " new instances...",
      stopping    : "↓".red     + " stopping `"     + "%(system)s".blue  + "` system, " + "%(from)d".red + " instances...",
      scaling_up  : "↑".green   + " scaling `"      + "%(system)s".blue  + "` system %(instances)s...",
      scaling_down: "↓".red     + " scaling `"      + "%(system)s".blue  + "` system %(instances)s...",
      options: {
        remove: "Removes the instances before stop",
        verbose: verbose,
      }
    },
    restart: {
      description: "Stops all system and starts again",
      options: {
        verbose: verbose,
        reprovision: reprovision,
      }
    },
    reload: {
      description: "Stops all system, re-provisions and starts again",
      deprecation: "`reload` this deprecated, use restart",
      options: {
        verbose: verbose,
        reprovision: reprovision,
      }
    },
    up: {
      description: "Starts all systems following the proper sequence according to dependencies",
    },
    status: {
      description: "Shows systems(s) instances status(es)",
      status: "%(system)s: %(instances)d instances - %(hosts)s",
      status_with_dead: "%(system)s: %(instances)d up and %(down)d down - %(hosts)s",
      options: {
        system: "System(s) name(s)",
        instances: "Shows details about instances",
        all: "Includes all instances (including those terminated)",
      }
    },
    vm: {
      description  : "Controls a virtual machine.",
      already      : "virtual machine already installed.",
      not_installed: "virtual machine is not installed, try `azk vm install`.",
      running      : "virtual machine running.",
      already_running : "virtual machine already running.",
      // TODO not_running
      not_runnig   : "virtual machine is not running, try `azk vm start`.",
      error        : "vm error: %(error)s.",
      not_requires : "this system not requires virtual machine, to try force this behavior set `AZK_USE_VM=true`",
    }
  },

  docker: {
    connect: "connecting to docker: %s..."
  },

  proxy: {
    adding_backend: "adding backend:%(backend)s to hostname:%(hostname)s...",
    removing_backend: "removing backend:%(backend)s to hostname:%(hostname)s...",
    request: "proxy request %s => %s",
    started: "proxy started in %s port",
    not_configured: "host '%s' not configured in proxy"
  },

  test: {
    before: "Before all tasks:",
    remove_containers: "- Removing %s containers before running tests...",
    remove_images: "- Removing %s images before running tests...",
    check_vm: "- Checking for required vm...",
    i18n_test: "test i18n module",
    commands: {
      test_help: {
        description: "Test help description",
        options: {
          verbose: "Verbose mode",
          string: "String option",
          flag: "Boolean flag",
          'flag-default': "Flag with default",
          subcommand: {
            name: "subcommand",
            options: {
              start: "Start service",
              stop: "Stop service",
            },
          }
        },
      },
    },
  }
}
