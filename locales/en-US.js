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
  },

  status: {
    agent: {
      running: "Agent is running...",
      not_running: "Agent is not running (try: `azk agent start`).",
      starting: "Agent is being started...",
      already: "Agent is already running.",
      started: "Agent has been successfully started.",
      // TODO: stopping
      stoping: "Agent is being stopped...",
      // TODO: stopped
      stoped: "Agent has been successfully stopped.",
      error: "Agent starting error: %(data)s.",
      wait: "Wait, this process may take several minutes",
    },

    vm: {
      installing: "installing virtual machine...",
      installed : "virtual machine has been successfully installed.",
      starting  : "starting virtual machine...",
      started   : "virtual machine has been successfully started.",
      // TODO: stopping
      stoping   : "stopping virtual machine...",
      // TODO: stopped
      stoped    : "virtual machine has been successfully stopped.",
      removing  : "removing virtual machine...",
      removed   : "virtual machine has been successfully removed.",
      // TODO: waiting
      wait      : "waiting for initialization of virtual machine...",
      initialized : "virtual machine is ready to use.",
      progress    : "trying connect to vm (%(host)s:%(port)d) (%(attempts)d/%(max)d)...",
    },

    socat: {
      progress : "trying to connect to docker (%(attempts)d/%(max)d)...",
    },

    balancer: {
      starting_memcached: "starting memcached...",
      started_memcached : "memcached started.",
      starting_hipache  : "starting hipache...",
      started_hipache   : "hipache started.",
      starting_socat    : "starting socat...",
      started_socat     : "socat started.",
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
    found: "A system of the `%(__type)s` type found in '%(dir)s'",
  },

  manifest: {
    not_found: "no such '%s' in current project",
    circular_depends: "Circular dependency between %(system1)s and %(system2)s",
    image_required: "Not image set for the `%(system)s' system",
    system_name_invalid: "The system name `%(system)s` is not valid.",
    depends_not_declared: "The `%(system)s` system depends on the `%(depend)s` system, which was not stated.",
    balancer_depreciation: "The `balancer` option used in the `%(system)s` is deprecated, use `http` and `scalable` to replace",
    invalid_default: "Unable to set the system `%(system)s` as a default because it was not declared",
  },

  system: {
    cmd_not_set: "Command not set in system \\`%(system)s\\`",
    seelog: "See the back log",
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
