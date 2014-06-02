var version = "Show azk version";

module.exports = {
  errors: {
    required_option_error: "Option %(option)s is required",
    system_depend_error: "System `%(system)s` depends on the system `%(depend)s`",
    image_not_available: "System `%(system)s` require image `%(image)s`, and not avaible",
  },

  app : {
    manifest: {
      not_found: "no such '%s' in current project"
    },

    box: {
      invalid: "'%s' is not a valid definition of box"
    },

    image: {
      provisioned: "image '%s' has be provisioned",
      not_provision: "application image '%s' not found, try `azk provision`"
    }
  },

  commands: {
    not_found: "Command '%s' not found",
    azk: {
      description: "Azk short help",
      options: {
        command: {
          name: "command"
        },
        log: "Set a log level",
        help: "Show this help",
        version: version,
      },
    },
    version: {
      description: version
    },
    agent: {
      description: "Control azk agent",
      start_fail: "Start agent fail: %s",
      status: {
        agent: {
          running: "Agent is running",
          not_running: "Agent is not running (try: azk agent start)",
          starting: "The agent is being initialized",
          already: "Agent is already running",
          started: "Agent has been successfully launched",
          stoping: "Agent is being finalized.",
          stoped: "Agent was successfully stoped.",
        },
        unfsd: {
          running: "Filesharing running",
          not_running: "Sharing files not running (try: azk agent reload)",
        },
        vm: {
          running: "",
          not_running: "",
        },
        balancer: {
          running: "",
          not_running: "",
        },
      },
      options: {
        force_vm: "Forces the use of the virtual machine when it is not needed (linux with docker)."
      }
    },
    exec: {
      description: "Run a command in application box context",
      check_image: "Check for image: `%s`",
      opts: {
        interactive: "Run command in interactive",
        image: "Docker image use to run command",
      }
    },
    help: {
      description: "Show help about the specific command",
      usage: 'Usage: $ %s',
      options: "options:",
    },
    helpers: {
      pull: {
        pulling: 'Pulling repository %s',
        bar_progress: '  :title [:bar] :percent :progress',
        bar_status: '  :title :msg',
      }
    },
    init: {
      description: "Initializes a project by adding the file azkfile.json",
      already: "'%s' already exists (try: --force)",
      generated: "'%s' generated",
    },
    kill: {
      description: "Kill a azk process by `azk pid`"
    },
    provision: {
      description: "Provision app image",
      removing: "Removing old image '%s'"
    },
    ps: {
      description: "Displays a information about the application process"
    },
    service: {
      description: "Control application services",
      instances: "number of instances to be added or removed",
      invalid_service: "'%s' not a valid service for this application",
      scale: "scale from %s to %s instances",
      not_runnig: "service not running",
      running: "running `%s` instances"
    },
    vm: {
      description: "Control a virtual machine",
      installing: "adding virtual machine...",
      installed: "virtual machine already installed.",
      installed_successfully: "virtual machine was successfully installed.",
      not_installed: "virtual machine is not installed, try `azk vm install`.",
      running: "virtual machine is running",
      not_runnig: "virtual machine is not running, try `azk vm start`",
      starting: "starting virtual machine...",
      started: "virtual machine was successfully started.",
      stoping: "stoping virtual machine...",
      stoped: "virtual machine was successfully stoped.",
      removing: "removing virtual machine...",
      removed: "virtual machine was successfully removed.",
      network_pogress: "try connect vm and configure hostonly ip (%(attempts)d/%(max)d) ...",
      setting_network: "configuring the network virtual machine...",
      network_configured: "virtual machine network configured.",
      configureip_fail: "virtual machine configure ip fail: %s",
    }
  },

  docker: {
    connect: "connecting docker: %s"
  },

  proxy: {
    adding_backend: "adding backend:%(backend)s to hostname:%(hostname)s",
    removing_backend: "removing backend:%(backend)s to hostname:%(hostname)s",
    request: "proxy request %s => %s",
    started: "proxy started in %s port",
    not_configured: "host '%s' not configured in proxy"
  },

  test: {
    before: "Before all tasks:",
    remove_containers: "- Removing %s containers before run tests",
    remove_images: "- Removing %s images before run tests",
    check_vm: "- Check for required vm",
    i18n_test: "test i18n module",
    commands: {
      test_help: {
        description: "Test help description",
        options: {
          verbose: "Verbose mode",
          string: "String option",
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
