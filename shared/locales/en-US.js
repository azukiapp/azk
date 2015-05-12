require('colors');

var version = "Shows azk version";
var verbose = "Sets the level of detail";
var quiet   = "Never prompt";
//var systems_options = "Targets systems of action";
var rebuild = "Force the rebuild, or pull image and reprovision before starting an instance";
var reprovision = "Force the provisioning actions before starting an instance";

// jscs:disable maximumLineLength
module.exports = {
  analytics: {
    question: [
      '=========================================================================\n'.grey,
      '  We\'re constantly looking for ways to make'.yellow,
      ' azk '.red,
      'better!\n'.yellow,
      '  May we anonymously report usage statistics to improve the tool over time? \n'.yellow,
      '  More info: https://github.com/azukiapp/azk and http://docs.azk.io/en/terms-of-use\n'.yellow,
      ' =========================================================================\n'.grey,
    ].join(''),
    message_optIn: [
      'cool! Thanks for helping us make azk better :)'.green,
    ].join(' '),
    message_optOut: [
      'No problem! If you change your mind and want to help us improve azk, just run `%(command)s`\n'.grey,
      'You can always find that command in `azk help`'.grey,
    ].join(''),
  },
  errors: {
    no_vm_started: "Unable to install and configure virtual machine",
    no_internet_connection: "\nNo internet connection!",
    lost_internet_connection: "\nLost internet connection:\n%(output)s",
    connect_docker_unavailable: "Could not initialize balancer because docker was not available",
    agent_not_running: "azk agent is required but is not running (try `azk agent status`)",
    agent_start: "azk agent start error: %(error)s",
    agent_stop:  "azk agent stop error (try `azk agent status`)",
    not_been_implemented: "This feature: `%(feature)s` has not been implemented yet",
    system_not_found: "System `%(system)s` not found in `%(manifest)s`",
    manifest_required: "Manifest is required, but was not found in `%(cwd)s`",
    manifest_error: "Manifest not valid (see http://doc.azk.io), error:\n%(err_message)s",
    required_option_error: "Option %(option)s is required",
    system_depend_error: "System `%(system)s` depends on the system `%(depend)s`",
    system_run_error: "Run system `%(system)s` return: (%(exitCode)d), for command: %(command)s:\n%(log)s",
    system_not_scalable: "System `%(system)s` is not scalable only one instance is allowed.",
    image_not_available: "System `%(system)s` requires image `%(image)s` which is not available",
    run_command_error: "Run `%(command)s` in system `%(system)s` error:\n`%(output)s`",
    provision_pull_error: "Error downloading/pulling docker image `%(image)s`, message: %(msg)s.",
    invalid_option_error: "Invalid argument option: %(option)s",
    invalid_value_error: "Invalid value: %(value)s in option %(option)s",
    image_not_exist: "Image from '%(image)s' was not found",
    provision_not_found: "Could not find '%(image)s' image",
    os_not_supported: "System not supported (see http://azk.io)",
    run_timeout_error: [
      "[timeout] `azk` has timed out on `%(system)s` system.",
      "[timeout] Failure to reach port `%(port)s` from `%(hostname)s` after %(retry)s attempt[s] of %(timeout)s milliseconds.",
      "[timeout] Make sure the start command binds `port` to the `0.0.0.0` interface, not only to the `localhost` interface.",
      "[timeout] You might want to edit your `Azkfile.js` in order to increase the maximum timeout.",
    ].join("\n"),

    vm_start: [
      "Error starting virtual machine.",
      "After `%(timeout)s` milliseconds, azk wasn't able to connect to the virtual machine.",
      "The virtual machine may possible be using a low memory amount, or your machine is slow.",
      "To help you debug the problem a screenshot was saved in `%(screen)s`.",
    ].join("\n"),

    docker_build_error: {
      command_error: "  Error in building `%(dockerfile)s`:\n%(output)s\n",
      server_error: "Internal error in build `%(dockerfile)s`: %(error)",
      not_found   : "Can't find `%(from)s` image to build `%(dockerfile)s`",
      can_find_dockerfile: "Can't find `%(dockerfile)s` file",
      can_find_add_file_in_dockerfile: "Can't find `%(source)s` file to ADD in `%(dockerfile)s`",
      unexpected_error: 'An unexpected error occurred in the build `%(dockerfile)s:\n%(output)s\n'
    },

    dependencies: {
      "*": {
        upgrade: ["\nYou are using `v%(current_version)s` version.",
                  "`v%(new_version)s` version is available.",
                  "Please, access http://azk.io to upgrade\n"].join("\n"),
        mv_resolver: "Upgrading domains error, moving files was not possible",
      },
      darwin: {
        VBoxManage     : 'VirtualBox not installed. Install before continuing.',
        network        : 'Networking error',
        custom_dns_port: 'Sorry, but Mac OS X supports only port `53` as `AZK_DNS_PORT`',
      },
      linux: {
        port_error: [
          "The %(port)s port configured for the `%(service)s` service is not available.",
          "Try configuring a different port setting %(env)s environment variable.",
          "Check http://docs.azk.io for more information.",
        ].join('\n'),
        docker_access: [
          "Could not connect to the docker service.",
          "Check if docker service is running.",
          "Also check if you have write permission to socket: '%(socket)s'",
        ].join('\n'),
      }
    }
  },

  status: {
    agent: {
      running: "Agent is running...",
      not_running: "Agent is not running (try: `azk agent start`).",
      starting: "Agent is being started...",
      already_running: "Agent is already running.",
      started: "Agent has been successfully started.",
      stopping: "Agent is being stopped...",
      stopped: "Agent has been successfully stopped.",
      error: "Agent starting error: %(data)s.",
      wait: "Wait, this process may take several minutes",
      progress: "progress...",
    },

    vm: {
      installing : "Installing virtual machine...",
      installed  : "Virtual machine has been successfully installed.",
      starting   : "Starting virtual machine...",
      started    : "Virtual machine has been successfully started.",
      stopping   : "Stopping virtual machine...",
      stopped    : "Virtual machine has been successfully stopped.",
      removing   : "Removing virtual machine...",
      removed    : "Virtual machine has been successfully removed.",
      waiting    : "Waiting for virtual machine boot...",
      ready      : "Virtual machine is ready to use.",
      progress   : "Trying to connect to vm (%(uri)s) (%(attempts)d/%(max)d)...",
      sshkey     : "Setting the ssh key to vm...",
      error      : "Error in vm process: %(data)s",
      docker_keys: "Downloading required keys to connect to docker",
      mounting   : "Mounting the shared folder in virtual machine...",
      mounted    : "Shared folder has been successfully mounted.",
    },

    socat: {
      progress : "Trying to connect to docker (%(attempts)d/%(max)d)...",
    },

    'balancer-redirect_connect': {
      progress: "Check if balancer redirect service is up (%(uri)s) (%(attempts)d/%(max)d)...",
    },

    balancer: {
      starting_memcached: "Starting memcached service...",
      started_memcached : "Memcached service started.",
      stopping_memcached: "Stopping memcached service...",
      stopped_memcached : "Memcached service was stopped.",
      exited_memcached  : "Memcached service was `exited`.",

      starting_hipache  : "Starting http balancer service...",
      started_hipache   : "Http balancer service started.",
      stopping_hipache  : "Stopping http balancer service...",
      stopped_hipache   : "Http balancer service was stopped.",
      exited_hipache    : "Http balancer service was `exited`.",

      'starting_balancer-redirect': "Starting azk balancer redirect service...",
      'started_balancer-redirect' : "Balancer redirect started.",
      'stopping_balancer-redirect': "Stopping balancer redirect...",
      'stopped_balancer-redirect' : "Balancer redirect was stopped.",

      starting_dns : "Starting azk dns service...",
      started_dns  : "Dns service started.",
      stopping_dns : "Stopping dns service...",
      stopped_dns  : "Dns service was stopped.",
      progress     : "Trying to connect to docker (%(uri)s) (%(attempts)d/%(max)d)...",
    },
  },

  generator: {
    found              : [
      "",
      "[%(systemName)s] `A %(__type)s` system was detected at '%(dir)s'.",
      "[%(systemName)s] The image suggested was `%(image)s`.",
    ].join("\n"),
    foundWithoutVersion: [
      "",
      "[%(systemName)s] A `%(__type)s` system was detected at '%(dir)s'.",
      "[%(systemName)s] The image suggested was `%(image)s`.",
      "[%(systemName)s] ! It was not possible to detect the `%(__type)s` specific version, so the standard version was suggested instead.",
      "[%(systemName)s] ! To change the image version you must edit the `Azkfile.js` file.",
      "[%(systemName)s] ! For more information see the documentation at http://docs.azk.io/en/images/index.html.",
    ].join("\n")
  },

  manifest: {
    balancer_deprecated   : "The `balancer` option used in the `%(system)s` is deprecated, use `http` and `scalable` instead",
    cannot_extends_itself : "The system `%(system)s` cannot extend itself",
    cannot_find_dockerfile: "Can't find Dockerfile in `%(dockerfile)s` path to build an image for `%(system)s` system",
    cannot_find_dockerfile_path: "Can't find `%(dockerfile)s` path to build an image for `%(system)s` system",
    circular_dependency   : "Circular dependency between %(system1)s and %(system2)s",
    depends_not_declared  : "The `%(system)s` system depends on the `%(depend)s` system, which was not declared.",
    extends_system_invalid: "The system `%(system_source)s` for extending system `%(system_to_extend)s` cannot be found",
    image_required        : "No image set for the `%(system)s' system",
    invalid_default       : "Unable to set the system `%(system)s` as a default because it was not declared",
    mount_and_persistent_deprecated: [
      "The `%(option)s` option used in system `%(system)s` is no longer supported.",
      "You must change the %(manifest)s to use `mounts`",
      "Check http://git.io/29JW0w for further information",
    ].join("\n"),
    not_found             : "No such '%s' in current project",
    provider_invalid      : "The provider was not found: `%(wrongProvider)s`.",
    system_name_invalid   : "The system name `%(system)s` is not valid.",
    required_path         : "Manifest class require a project path",
    validate: {
      deprecated : "The `%(option)s` used in `%(system)s` is deprecated, check the documentation for `%(new_option)s`",
      no_system_set: "No system has been set yet, check the documentation",
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
    adding_ip: "Adding %(ip)s to %(file)s ...",
    generating_key: "Generating public/private rsa key pair to connect to vm.\n",
    vm_ip_msg: ([
      "",
      "In order to give `azk` access to `azk agent`,",
      "it is necessary to define an IP address to the virtual machine.",
      "This IP address will be used to establish a private network",
      "between the physical machine running `azk` and the virtual",
      "machine where `azk agent` is running.",
      "",
    ]).join('\n'),
    check_version: 'Checking version...',
    latest_azk_version: 'azk %(current_version)s detected',
    check_version_no_internet: 'Checking version: there is no internet connection to check azk version.',
    check_version_error: 'Checking version: %(error_message)s',
    clean_containers: "Clearing %(count)d lost containers",
    migrations: {
      alert             : "azk updated, checking update procedures...",
      changing_domain   : "Changing domain upgrading, (issue: #255)",
      moving_resolver   : "Moving %(origin)s to %(target)s ...",
      renaming_vm       : "Renaming VirtualBox machine %(old_name)s to %(new_name)s",
    },
    find_suggestions_ips: "Suggesting a new ip...",
    errors: {
      unmatched_dns_port: 'The current dns port `%(old)s` set in `%(file)s` differs from env var `AZK_DNS_PORT=%(new)s`',
      invalid_current_ip: 'Current ip `%(ip)s` conflicts with network interface `%(inter_name)s inet %(inter_ip)s`',
      ip_invalid : "`%(ip)s`".yellow + " is an invalid v4 ip, try again.",
      ip_loopback: "`%(ip)s`".yellow + " conflict with loopback network",
      ip_conflict: "`%(ip)s`".yellow + " conflict with network interface `%(inter_name)s inet %(inter_ip)s`",
    },
  },

  commands: {
    not_found: "Command '%s' not found",
    azk: {
      description: "azk short help",
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
      start_before: "The agent is not running, would you like to start it?",
      options: {
        verbose: verbose,
        quiet: quiet,
        action: {
          name: "actions".magenta,
          options: {
            start: "Start azk agent",
            status: "Shows azk agent status",
            stop: "Stops azk agent running in the background",
          }
        },
        'reload-vm': "Reloads the virtual machine settings",
        daemon: "Runs azk agent in background mode",
      }
    },
    docker: {
      options: {
        verbose: verbose,
        quiet: quiet,
      },
      description: "Alias for calling docker in 'azk' scope configuration",
    },
    doctor: {
      description: "Shows an analysis of `azk`'s health",
      options: {
        logo: "Shows the `azk` logo before showing health information",
        verbose: verbose,
        quiet: quiet,
      },
    },
    info: {
      description: "Shows systems information for the current `Azkfile.js`",
      options: {
        verbose: verbose,
        quiet: quiet,
        colored: "Outputs with colors",
      },
    },
    logs: {
      description: "Shows logs for the systems",
      options: {
        verbose: verbose,
        quiet: quiet,
        follow: "Follow log output",
        lines: "Output the specified number of lines at the end of logs",
        timestamps: "Show timestamps",
      },
    },
    shell: {
      description: "Initializes a shell with instance context, or runs a specified command",
      invalid_mount: "Invalid mount parameter: `%(value)s`, use `point:[path:|persitent:]origin`",
      invalid_env: "Invalid env variable: `%(value)s`, use `VARIABLE=VALUE`",
      options: {
        T: "Disables pseudo-tty allocation",
        t: "Forces pseudo-tty allocation",
        system  : "A system context to execute a shell or command",
        remove  : "Removes shell instances after exit shell or command",
        command : "Runs a specific command",
        shell   : "The path to the shell binary",
        silent  : "Prevents any log message about the command execution. It's useful when using the `-c` option and the output is used as input to another command using the pipe `|` operator.",
        verbose : verbose,
        quiet   : quiet,
        mount   : "Points to additional mounting (ex:./origin:/azk/target)",
        cwd     : "Default directory",
        image   : "Defines the image in which the command will be executed",
        env     : "Additional environment variables",
      },
      ended: {
        removed: "finished, because the container was removed",
        docker_end: "finished, because docker was finalized",
        docker_not_found: "finished, because docker was not found",
      },
      examples: [
        '$ azk shell --shell /bin/bash',
        '$ azk shell [system_name] --mount /=/azk/root -e RAILS_ENV=dev',
        '$ azk shell [system_name] -c "ls -l /"',
        '$ azk shell --image azukiapp/budybox -t -c "/bin/bash"',
      ]
    },
    help: {
      description: "Shows help about a specific command",
      usage: 'Usage:'.blue + ' $ %s',
      options: "options:".green,
      examples: "examples:".yellow,
    },
    helpers: {
      pull: {
        pulling            : 'Pulling repository %s...',
        bar_progress       : '  :title [:bar] :percent :progress',
        bar_status         : '  :title :msg',
        pull_getLayersDiff : "⇲".blue    + " comparing registry layers and local layers...",
        pull_layers_left      : "⇲".blue    + " %(non_existent_locally_ids_count)s layers left to download.",
        pull_start         : "⇲".blue    + " pulling %(left_to_download_count)s/%(total_registry_layers)s layers.",
        pull_ended         : "\n" + "✓".blue    + " completed download of `" + "%(image)s".yellow + "`\n",
        already_being      : "⇲".yellow  + " image already being pulled. Please wait...",
      }
    },
    init: {
      description: "Initializes a project by adding the file Azkfile.js",
      already_exists: "'%s' already exists (try: `--force`)",
      generated: "'%s' generated",
      github: "\nTip:\n  Adds the `.azk` to .gitignore\n  echo '.azk' >> .gitignore \n",
      not_found: "System(s) not found, generating with example system.",
      options: {
        force: "Forces overwrite of Azkfile.js",
      }
    },
    start: {
      description: "Starts an instance of the system(s)",
      already_started: "System `%(name)s` already started",
      fail: "Due to the above error azk will stop all instances already running.\n",
      options: {
        verbose: verbose,
        rebuild: rebuild,
        quiet   : quiet,
        reprovision: reprovision,
        open: "Open a url of a default system in the preferred application",
      },
      option_errors: {
        open: {
          default_system_not_balanceable: "\nThe default system `%(name)s` does not have ports http to open.",
          system_not_running: "System `%(name)s` is not running to open.",
        }
      }
    },
    stop: {
      description: "Stops an instance of the system(s)",
      not_running: "System `%(name)s` not running",
      options: {
        verbose : verbose,
        quiet   : quiet,
        remove: "Removes the instances before stopping",
      }
    },
    scale: {
      instances   : "from " + "%(from)d".red + " to " + "%(to)d".green + " instances",
      description : "Scales (up or down) an instance of the system(s)",
      wait_port   : "◴".magenta + " waiting for `" + "%(system)s".blue  + "` system to start, trying connection to port %(name)s/%(protocol)s...",
      check_image : "✓".cyan    + " checking `"      + "%(image)s".yellow + "` image...",
      pull_image  : "⇲".blue    + " downloading `"   + "%(image)s".yellow + "` image...",
      build_image : "⇲".blue    + " building `"      + "%(image)s".yellow + "` image...",
      provision   : "↻".yellow  + " provisioning `"  + "%(system)s".blue  + "` system...",
      starting    : "↑".green   + " starting `"      + "%(system)s".blue  + "` system, " + "%(to)d".green + " new instances...",
      stopping    : "↓".red     + " stopping `"      + "%(system)s".blue  + "` system, " + "%(from)d".red + " instances...",
      scaling_up  : "↑".green   + " scaling `"       + "%(system)s".blue  + "` system %(instances)s...",
      scaling_down: "↓".red     + " scaling `"       + "%(system)s".blue  + "` system %(instances)s...",
      options: {
        remove: "Removes the instances before stopping",
        verbose: verbose,
        quiet: quiet,
      }
    },
    restart: {
      description: "Stops all systems and starts them again",
      options: {
        verbose: verbose,
        rebuild: rebuild,
        quiet   : quiet,
        reprovision: reprovision,
        open: "Open a url of the default system in the preferred application",
      }
    },
    reload: {
      description: "Stops all systems, run provision commands and starts them again",
      deprecation: "`reload` is deprecated, use restart",
      options: {
        verbose: verbose,
        rebuild: rebuild,
        quiet   : quiet,
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
        verbose : verbose,
        quiet   : quiet,
        system: "System(s) name(s)",
        instances: "Shows details about instances",
        all: "Includes all instances (including those terminated)",
        long: "Show all columns",
        text: "Show in text mode",
      }
    },
    config: {
      description: "Controls azk configuration options",
      options: {
        verbose : verbose,
        quiet   : quiet,
        action: {
          name: "actions".magenta,
          options: {
            'track-status': "Displays tracking status",
            'track-toggle': "Toggles tracking behavior on/off",
          }
        }
      },
      'tracking-false': 'currently azk is not tracking any data',
      'tracking-true' : 'currently azk is tracking data, more info: https://github.com/azukiapp/azk and http://docs.azk.io/en/terms-of-use',
    },
    vm: {
      description  : "Controls a virtual machine.",
      already_installed  : "Virtual machine already installed.",
      not_installed: "Virtual machine is not installed.",
      running      : "Virtual machine running.",
      already_running : "Virtual machine already running.",
      not_running  : "Virtual machine is not running, try `azk vm start`.",
      error        : "vm error: %(error)s.",
      not_required : "This system does not require a virtual machine, to try to force this behavior set `AZK_USE_VM=true`",
      options: {
        action: {
          name: "actions".magenta,
          options: {
            ssh: "Connect via SSH to the virtual machine",
            installed: "Check if the virtual machine is installed",
            start: "Start virtual machine",
            status: "Check virtual machine status",
            stop: "Stop virtual machine",
            remove: "Remove virtual machine but keep its contents",
          },
        },
        force: [
          "Forces the removal of the virtual machine, without waiting",
          "for a graceful shutdown. This is useful when you want to stop",
          "a virtual machine in a removal process that is failing",
        ].join(' '),
        quiet   : quiet,
        verbose : verbose,
      }
    }
  },

  docker: {
    connect: "Connecting to docker: %s..."
  },

  proxy: {
    adding_backend: "Adding backend:%(backend)s to hostname:%(hostname)s...",
    removing_backend: "Removing backend:%(backend)s to hostname:%(hostname)s...",
    request: "Proxy request %s => %s",
    started: "Proxy started in %s port",
    not_configured: "Host '%s' not configured in proxy"
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
          'string-placeholder': "String option with placeholder",
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
  },
  
  tracking: {
    timeout: "Analytics tracker timed out."
  }
};
// jscs:enable maximumLineLength
