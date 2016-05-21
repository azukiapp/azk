
// jscs:disable maximumLineLength
module.exports = {
  terms_of_use: {
    first_question: [
      '${gray}=========================================================================\n${gray.close}',
      '${yellow}  Thank you for using${yellow.close}',
      '${red} azk${red.close}',
      '${yellow}! Welcome!\n${yellow.close}',
      '${yellow}  Before we start, we need to ask: do you accept our Terms of Use?\n${yellow.close}',
      '${yellow}  http://docs.azk.io/en/terms-of-use\n${yellow.close}',
      '${gray} =========================================================================\n${gray.close}',
    ].join(''),
    you_need_question: [
      '${gray}=========================================================================\n${gray.close}',
      '${yellow}  So… you can\'t start to use ${yellow.close}',
      '${red}azk${red.close}',
      '${yellow} before accepting the Terms of Use. Sorry.\n${yellow.close}',
      '${yellow}  Do you accept our Terms of Use?${yellow.close}',
      '${yellow}  http://docs.azk.io/en/terms-of-use\n${yellow.close}',
      '${gray} =========================================================================\n${gray.close}',
    ].join(''),
  },
  crashReport: {
    message_error_occured: [
      'Sorry, an error has occurred.\n',
      'A crash report about this error will be sent to azk team in order to make azk better.',
    ].join(''),
    sending: 'Sending bug report to Azuki...',
    was_sent: 'Bug report was sent. Thanks.',
    was_not_sent: 'Bug report can not be shipped. Sorry.',

    email: {
      question: [
        '${yellow}Bonus: if you\'re ok with telling us your email address,${yellow.close}',
        '${yellow} we\'ll be able to reply you with a solution for this issue.\n${yellow.close}',
        '${yellow}Important: Your email will be saved for future crash reports (we\'ll never share your email).\n${yellow.close}',
        '${yellow}You can always delete/update your email at any time. See http://docs.azk.io/en/reference/cli/config.html#azk-config\n${yellow.close}',
          '${white}Enter your email${white.close}' + '${gray} [optional]${gray.close}' + '${white}:${white.close}',
      ].join(''),
      question_always_ask_email: [
        'Ask email again for future crash report solutions?',
      ].join(''),
    },
  },
  errors: {
    unknown_error               : "Unknown error: %(error)j",
    no_vm_started               : "Unable to install and configure virtual machine",
    no_internet_connection      : "\nNo internet connection!",
    lost_internet_connection    : "\nLost internet connection or error while connecting to docker registry:\n%(output)s",
    must_accept_terms_of_use    : "${red}Sorry, must accept terms of use before use azk.${red.close}",
    connect_docker_unavailable  : "Could not initialize balancer because docker was not available",
    agent_not_running           : "azk agent is required but is not running (try `azk agent status`)",
    agent_start                 : "azk agent start error: %(err_message)s",
    agent_stop                  : "azk agent stop error (try `azk agent status`)",
    not_been_implemented        : "This feature: `%(feature)s` has not been implemented yet",
    system_not_found            : "System `%(system)s` not found in `%(manifest)s`",
    manifest_required           : "Manifest file (`Azkfile.js`) was not found at `%(cwd)s` (see more at http://docs.azk.io/en/azkfilejs/)",
    manifest_error              : "Manifest file (%(file)s) is not valid (erro type: %(type)s),\nSee more at http://docs.azk.io/en/azkfilejs/\n\nError:\n%(err_message)s",
    system_depend_error         : "System `%(system)s` depends on the system `%(depend)s`",
    system_run_error            : "Run system `%(system)s` return: (%(exitCode)d), for command: %(command)s:\n%(log)s\n\nLook for azk start troubleshooting documentation for more info at: http://bit.ly/azk_start_troubleshooting\n",
    system_not_scalable         : "System `%(system)s` is not scalable only one instance is allowed.",
    image_not_available         : "System `%(system)s` requires image `%(image)s` which is not available",
    run_command_error           : "Run `%(command)s` in system `%(system)s` error:\n`%(output)s`\n\nLook for azk start troubleshooting documentation for more info at: http://bit.ly/azk_start_troubleshooting\n",
    provision_pull_error        : "Error downloading/pulling docker image `%(image)s`, message: %(msg)s.",
    invalid_command_error       : "Invalid command: %(command)s",
    image_not_exist             : "Image from '%(image)s' was not found",
    provision_not_found         : "Could not find '%(image)s' image",
    rsync_invalid_version_format: "Invalid rsync version format: %(rsync_version)s",
    os_not_supported            : "System not supported (see http://azk.io)",
    run_timeout_error: [
      "[timeout] `azk` has timed out on `%(system)s` system.",
      "[timeout] Failure to reach port `%(port)s` from `%(hostname)s` after %(timeout)s milliseconds.",
      "[timeout] Make sure the start command binds `port` to the `0.0.0.0` interface, not only to the `localhost` interface.",
      "[timeout] You might want to edit your `Azkfile.js` in order to increase the maximum timeout.",
    ].join("\n"),
    configuration: {
      invalid_key_error : [
        "${red}%(key)s${red.close}",
        "${yellow} it is not a valid configuration key.\n${yellow.close}",
        "${yellow}Please, run command bellow to check all existent configurations keys:\n${yellow.close}",
        "${gray} $ ${gray.close}",
        "${white}azk config list${white.close}",
      ].join(""),
      invalid_value_regex_error : [
        "${red}%(value)s${red.close}",
        "${yellow} it is not valid value for ${yellow.close}",
        "${white}%(key)s${white.close}",
        "${yellow}.${yellow.close}",
      ].join(""),
      void_value_error : [
        "${yellow}Please, provide a value for ${yellow.close}",
        "${white}%(key)s${white.close}",
        "${yellow}.${yellow.close}",
      ].join(""),
      invalid_value_boolean_error : [
        "${red}%(value)s${red.close}",
        "${yellow} it is not valid value for ${yellow.close}",
        "${white}%(key)s${white.close}",
        "${yellow}.${yellow.close}",
      ].join(""),
    },

    vm_start: [
      "Error starting virtual machine.",
      "After `%(timeout)s` milliseconds, azk wasn't able to connect to the virtual machine.",
      "The virtual machine may possible be using a low memory amount, or your machine is slow.",
      "To help you debug the problem a screenshot was saved in `%(screen)s`.",
    ].join("\n"),

    docker_build_error: {
      command_error                  : "  Error in building `%(dockerfile)s`:\n%(output)s\n",
      server_error                   : "Internal error in build `%(dockerfile)s`: %(error)s",
      unknow_instrction_error        : "Unknown instruction in build `%(dockerfile)s`: %(instruction)s",
      not_found                      : "Can't find `%(from)s` image to build `%(dockerfile)s`",
      can_find_dockerfile            : "Can't find `%(dockerfile)s` file",
      can_find_add_file_in_dockerfile: "Can't find `%(source)s` file to ADD in `%(dockerfile)s`",
      unexpected_error               : 'An unexpected error occurred in the build `%(dockerfile)s:\n%(output)s\n'
    },

    dependencies: {
      "*": {
        upgrade: ["\nYou are using `v%(current_version)s` version.",
                  "`v%(new_version)s` version is available.",
                  "Please, access http://azk.io to upgrade\n"].join("\n"),
        mv_resolver: "Upgrading domains error, moving files was not possible",
        check_docker_version_error: [
          'Checking Docker version:',
          'Detected:    %(current_version)s',
          'Required: >= %(min_version)s',
          'Please update Docker before continue.'
        ].join('\n'),
        check_docker_version_invalid: [
          'Checking Docker version:',
          'Detected:    %(current_version)s',
          'Required: >= %(min_version)s',
          'The `%(current_version)s` version is not in a http://semver.org format.',
          'You can force Docker version by setting the env var `AZK_DOCKER_VERSION`',
        ].join('\n'),
        rsync      : "`rsync` command is required, but it's not installed or it's not in the $PATH. Please install it before continue.",
        check_rsync_version_error: [
          'Checking rsync version:',
          'Detected:    %(current_version)s',
          'Required: >= %(min_version)s',
          'Please update rsync before continue.'
        ].join('\n'),
      },
      darwin: {
        VBoxManage     : '`VirtualBox` command is required, but it\'s not installed or it\'s not in the $PATH. Please install it before continue.',
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
      },
    },

    get_project: {
      cloning_not_a_git_repo : "`%(git_repo)s` is not a git valid repository.",
      folder_already_exists  : "Folder `%(git_destination_path)s` already exists.",
      commit_not_exist       : "Branch or Commit `%(git_branch_tag_commit)s` does not exist.",
      not_resolve_host       : "Invalid git URL: `%(git_repo)s`.",
      repo_not_found         : "Repository not found `%(git_repo)s`.",
      cannot_create_folder   : "Cannot create folder `%(git_destination_path)s`",
      git_error              : [
        "Uncaught git error",
        " > git_repo              : %(git_repo)s",
        " > git_branch_tag_commit : %(git_branch_tag_commit)s",
        " > git_destination_path  : %(git_destination_path)s",
        " > original_error        : %(original_error)s",
        " > stack_trace           : %(stack_trace)s",
      ].join('\n'),
      force_response_ok     : "stats response: `%(response_json)s`",
    },

  },

  status: {
    docker: {
      down: "Docker is down",
    },

    agent: {
      running        : "Agent is running...",
      not_running    : "Agent is not running (try: `azk agent start`).",
      starting       : "Agent is being started...",
      already_running: "Agent is already running.",
      started        : "Agent has been successfully started.",
      stopping       : "Agent is being stopped...",
      stopped        : "Agent has been successfully stopped.",
      error          : "Agent starting error: %(data)s.",
      wait           : "Please wait, this process may take several minutes",
      progress       : "progress...",
    },

    vm: {
      installing : "Installing virtual machine...",
      installed  : "Virtual machine has been successfully installed.",
      starting   : "Starting virtual machine...",
      started    : "Virtual machine has been successfully started.",
      stopping   : "Trying to stop virtual machine...",
      forced     : "Forcing the stop virtual machine...",
      stopped    : "Virtual machine has been successfully stopped.",
      removing   : "Removing virtual machine...",
      removed    : "Virtual machine has been successfully removed.",
      waiting    : "Waiting for virtual machine boot...",
      ready      : "Virtual machine is ready to use.",
      progress   : "Trying to connect to vm (%(uri)s) (timeout: %(timeout)ds)...",
      sshkey     : "Setting the ssh key to vm...",
      error      : "Error in vm process: %(data)s",
      docker_keys: "Downloading required keys to connect to docker",
      mounting   : "Mounting the shared folder in virtual machine...",
      mounted    : "Shared folder has been successfully mounted.",
    },

    'balancer-redirect': {
      wait: "Check if balancer redirect service is up (%(uri)s) (timeout: %(timeout)ds)...",
    },

    balancer: {
      starting_memcached: "Starting memcached service...",
      started_memcached : "Memcached service started.",
      stopping_memcached: "Stopping memcached service...",
      stopped_memcached : "Memcached service was stopped.",
      exited_memcached  : "Memcached service was `exited`.",

      starting_hipache: "Starting http balancer service...",
      started_hipache : "Http balancer service started.",
      stopping_hipache: "Stopping http balancer service...",
      stopped_hipache : "Http balancer service was stopped.",
      exited_hipache  : "Http balancer service was `exited`.",

      'starting_balancer-redirect': "Starting azk balancer redirect service...",
      'started_balancer-redirect' : "Balancer redirect started.",
      'stopping_balancer-redirect': "Stopping balancer redirect...",
      'stopped_balancer-redirect' : "Balancer redirect was stopped.",

      starting_dns: "Starting azk dns service...",
      started_dns : "Dns service started.",
      stopping_dns: "Stopping dns service...",
      stopped_dns : "Dns service was stopped.",
      progress    : "Trying to connect to docker (%(uri)s) (timeout: %(timeout)ds)...",
    },
  },

  generator: {
    found              : [
      "",
      "A `%(__type)s` system was detected at `%(dir)s`:",
      "- The image suggested was `%(image)s`.",
    ].join("\n"),
    foundWithoutVersion: [
      "",
      "It was not possible to detect specific version(s) for `%(types)s`, so the standard(s) version was suggested instead.",
      "To change the image(s) version you must edit the `Azkfile.js` file.",
      "For more information see the documentation at http://docs.azk.io/en/images/index.html.",
    ].join("\n")
  },

  manifest: {
    balancer_deprecated        : "The `balancer` option used in the `%(system)s` is deprecated, use `http` and `scalable` instead",
    cannot_extends_itself      : "The system `%(system)s` cannot extend itself",
    cannot_find_dockerfile     : "Can't find Dockerfile in `%(dockerfile)s` path to build an image for `%(system)s` system",
    cannot_find_dockerfile_path: "Can't find `%(dockerfile)s` path to build an image for `%(system)s` system",
    circular_dependency        : "Circular dependency between %(system1)s and %(system2)s",
    depends_not_declared       : "The `%(system)s` system depends on the `%(depend)s` system, which was not declared.",
    extends_system_invalid     : "The system `%(system_source)s` for extending system `%(system_to_extend)s` cannot be found",
    image_required             : "No image set for the `%(system)s' system",
    invalid_default            : "Unable to set the system `%(system)s` as a default because it was not declared",
    extra_docker_start_deprecated  : [
      "The `%(option)s` option used in system `%(system)s` is no longer supported.",
      "Check http://bit.ly/azkfile_docker_extra for further information",
    ].join("\n"),
    mount_and_persistent_deprecated: [
      "The `%(option)s` option used in system `%(system)s` is no longer supported.",
      "You must change the %(manifest)s to use `mounts`",
      "Check http://bit.ly/upgrading-from-azk-051 for further information",
    ].join("\n"),
    not_found          : "No such '%s' in current project",
    provider_invalid   : "The provider was not found: `%(wrongProvider)s`.",
    system_name_invalid: "The system name `%(system)s` is not valid.",
    required_path      : "Manifest class require a project path",
    validate           : {
      deprecated_title: "${red}List of deprecations:${red.close}",
      deprecated : "- The `%(option)s` used in `%(system)s` is deprecated, check the documentation for `%(new_option)s`",
      deprecated_token: "- `%(token_open)s%(token_close)s` is deprecated, use `${green}%(suggestion)s${green.close}` instead of `${red}%(original)s${red.close}` on `${yellow}%(system)s.%(option)s${yellow.close}`",
      no_system_set: "No system has been set yet, check the documentation",
      invalid_option_value: [
        "Invalid value for `%(option)s`. Value: `%(value)s`.",
        "Please, change `%(system_name)s` system to a valid `%(option)s` value.",
        "Check %(docs_url)s for further information.",
      ].join("\n"),
      invalid_option_type: [
        "Error parsing `%(option)s` value. Invalid type. Value: `%(value)s`.",
        "Please, change `%(system_name)s` system to a valid `%(option)s` type and value.",
        "Check %(docs_url)s for further information.",
      ].join("\n"),
    },
  },

  system: {
    cmd_not_set: "Command not set in system \\`%(system)s\\`",
    seelog     : "See the back log",
  },

  configure: {
    loaded          : "Settings loaded successfully.",
    loading_checking: "Loading settings and checking dependencies.",
    ip_question     : "Enter the vm ip",
    adding_ip       : "Adding %(ip)s to %(file)s ...",
    generating_key  : "Generating public/private rsa key pair to connect to vm.\n",
    vm_ip_msg       : ([
      "",
      "In order to give `azk` access to `azk agent`,",
      "it is necessary to define an IP address to the virtual machine.",
      "This IP address will be used to establish a private network",
      "between the physical machine running `azk` and the virtual",
      "machine where `azk agent` is running.",
      "",
    ]).join('\n'),
    check_version            : 'Checking version...',
    latest_azk_version       : 'azk %(current_version)s detected',
    current_rsync_version    : 'rsync %(current_version)s detected',
    github_azk_version_error : 'Failed to access Github to get azk latest version number',
    check_version_no_internet: 'Checking version: there is no internet connection to check azk version.',
    check_version_error      : 'Checking version: %(error_message)s',
    clean_containers         : "Cleaning %(count)d lost containers",
    migrations: {
      alert          : "azk updated, checking update procedures...",
      changing_domain: "Changing domain upgrading, (issue: #255)",
      moving_resolver: "Moving %(origin)s to %(target)s ...",
      renaming_vm    : "Renaming VirtualBox machine %(old_name)s to %(new_name)s",
    },
    find_suggestions_ips: "Suggesting a new ip...",
    errors: {
      unmatched_dns_port: 'The current dns port `%(old)s` set in `%(file)s` differs from env var `AZK_DNS_PORT=%(new)s`',
      invalid_current_ip: 'Current ip `%(ip)s` conflicts with network interface `%(inter_name)s inet %(inter_ip)s`',
      ip_invalid        : "${yellow}`%(ip)s`${yellow.close}" + " is an invalid v4 ip, try again.",
      ip_loopback       : "${yellow}`%(ip)s`${yellow.close}" + " conflict with loopback network",
      ip_conflict       : "${yellow}`%(ip)s`${yellow.close}" + " conflict with network interface `%(inter_name)s inet %(inter_ip)s`",
    },
  },

  commands: {
    not_found: "Command '%s' not found",
    agent    : {
      start_fail  : "Agent start fail: %s",
      start_before: "The agent is not running, would you like to start it?",
    },
    shell: {
      invalid_mount: "Invalid mount parameter: `%(value)s`, use `point:[path:|persitent:]origin`",
      invalid_env  : "Invalid env variable: `%(value)s`, use `VARIABLE=VALUE`",
      ended        : {
        removed: "finished, because the container was removed",
        docker_end: "finished, because docker was finalized",
        docker_not_found: "finished, because docker was not found",
      },
    },
    help: {
      actions  : "${red}Actions:${red.close}",
      arguments: "${cyan}Arguments:${cyan.close}",
      commands : "${yellow}Commands:${yellow.close}",
      examples : "${magenta}Examples:${magenta.close}",
      options  : "${green}Options:${green.close}",
      usage    : '${blue}Usage:${blue.close}',
    },
    helpers: {
      pull: {
        pulling           : 'Pulling repository %s...',
        bar_progress      : '  :title [:bar] :percent :progress',
        bar_status        : '  :title :msg',
        pull_getLayersDiff: "${blue}⇲${blue.close}"    + " comparing registry layers and local layers...",
        pull_layers_left  : "${blue}⇲${blue.close}"    + " %(non_existent_locally_ids_count)s layers left to download.",
        pull_start        : "${blue}⇲${blue.close}"    + " pulling %(left_to_download_count)s/%(total_registry_layers)s layers.",
        pull_ended        : "\n" + "${blue}✓${blue.close}"    + " completed download of `" + "${yellow}%(image)s${yellow.close}" + "`\n",
        already_being     : "${yellow}⇲${yellow.close}"  + " image already being pulled. Please wait...",
      }
    },
    init: {
      already_exists: "'%s' already exists (try: `--force`)",
      generated     : "\n'%s' generated",
      github        : "\nTip:\n  Adds the `.azk` to .gitignore\n  echo '.azk' >> .gitignore \n",
      not_found     : "System(s) not found, generating with example system.",
    },
    start: {
      already_started: "System `%(name)s` already started",
      skip           : "Skip starting, system `" + "${blue}%(name)s${blue.close}" + "` does not scale.",
      fail           : "An error occurred. It will stop all instances already running. See details below.\n",
      get_project: {
        getting_git_version      : "Checking Git version...",
        getting_remote_info      : "Getting remote info from `%(git_url)s`...",
        checking_destination     : "Checking `%(git_destination_path)s` exists...",
        git_pull                 : "Pulling changes from remote server...",
        cloning_to_folder        : "Cloning `%(git_url)s#%(git_branch_tag_commit)s` to `%(git_destination_path)s`...",
        cloning_master_to_folder : "Cloning `%(git_url)s` to `%(git_destination_path)s`...",
        checkout_to_commit       : "Checkout to `%(git_branch_tag_commit)s` in `%(git_destination_path)s`...",
        final_started_message: [
          "",
          "The app was cloned and started.",
          "Now you can go to its folder and run azk commands:",
          "$ cd '%(git_destination_path)s'",
          "$ azk status",
          "",
          "You can also easily deploy it to DigitalOcean.",
          "To learn how, check http://docs.azk.io/en/deploy",
          "",
          "If you need any support, check our chat support at:",
          "https://gitter.im/azukiapp/azk",
          ""
        ].join('\n'),
        dest_exists_branch: [
          ">   ",
          ">   Destination folder already exists.",
          ">   ",
          ">   1) If you want to start the existing system, run the commands below:",
          ">        $ cd '%(git_destination_path)s'",
          ">        $ azk start",
          ">   ",
          ">   2) If you want to update the repository to the latest version, do it",
          ">      with git and then start azk:",
          ">        $ cd '%(git_destination_path)s'",
          ">        $ git pull %(git_url)s %(git_branch_tag_commit)s",
          ">        $ azk start -Rv",
          ">   ",
          ">   3) To replace the existing project with the latest one, run the ",
          ">      following commands (the existing destination folder will be deleted):",
          ">   ",
          ">        $ sudo rm -Rf '%(git_destination_path)s'",
          ">        $ azk start %(git_url)s#%(git_branch_tag_commit)s %(git_destination_path)s",
          ">   ",
          ">   If you are getting errors go to troubleshooting: http://docs.azk.io/en/troubleshooting/README.html",
          ">   ",
        ].join('\n'),
        dest_exists_commit: [
          ">   ",
          ">   Destination folder already exists.",
          ">   ",
          ">   1) If you want to start the existing system, run the commands below:",
          ">        $ cd '%(git_destination_path)s'",
          ">        $ azk start",
          ">   ",
          ">   2) If you want to update the repository to the latest version, do it",
          ">      with git and then start azk:",
          ">        $ cd '%(git_destination_path)s'",
          ">        $ git pull origin",
          ">        $ git checkout %(git_branch_tag_commit)s",
          ">        $ azk start -Rv",
          ">   ",
          ">   3) To replace the existing project with the latest one, run the ",
          ">      following commands (the existing destination folder will be deleted):",
          ">   ",
          ">        $ sudo rm -Rf '%(git_destination_path)s'",
          ">        $ azk start %(git_url)s#%(git_branch_tag_commit)s %(git_destination_path)s",
          ">   ",
          ">   If you are getting errors go to troubleshooting: http://docs.azk.io/en/troubleshooting/README.html",
          ">   ",
        ].join('\n'),
      },
    },
    stop: {
      not_running: "System `" + "${blue}%(name)s${blue.close}" + "` not running",
      skip: "Skip stoping, system `" + "${blue}%(name)s${blue.close}" + "` does not scale.",
    },
    scale: {
      instances   : "from " + "${red}%(from)d${red.close}"             + " to " + "${green}%(to)d${green.close}" + " instances",
      sync        : "${yellow}⎘${yellow.close}"  + " syncing files for `" + "${blue}%(system)s${blue.close}"     + "` system...",
      wait_port   : "${magenta}◴${magenta.close}" + " waiting for `"       + "${blue}%(system)s${blue.close}"     + "` system to start, trying connection to port %(name)s/%(protocol)s...",
      check_image : "${cyan}✓${cyan.close}"    + " checking `"          + "${yellow}%(image)s${yellow.close}"    + "` image...",
      pull_image  : "${blue}⇲${blue.close}"    + " downloading `"       + "${yellow}%(image)s${yellow.close}"    + "` image...",
      build_image : "${blue}⇲${blue.close}"    + " building `"          + "${yellow}%(image)s${yellow.close}"    + "` image...",
      provision   : "${yellow}↻${yellow.close}"  + " provisioning `"      + "${blue}%(system)s${blue.close}"     + "` system...",
      starting    : "${green}↑${green.close}"   + " starting `"          + "${blue}%(system)s${blue.close}"     + "` system, " + "${green}%(to)d${green.close}" + " new instances...",
      stopping    : "${red}↓${red.close}"     + " stopping `"          + "${blue}%(system)s${blue.close}"     + "` system, " + "${red}%(from)d${red.close}" + " instances...",
      scaling_up  : "${green}↑${green.close}"   + " scaling `"           + "${blue}%(system)s${blue.close}"     + "` system %(instances)s...",
      scaling_down: "${red}↓${red.close}"     + " scaling `"           + "${blue}%(system)s${blue.close}"     + "` system %(instances)s...",
    },
    status: {
      status          : "%(system)s: %(instances)d instances - %(hosts)s",
      status_with_dead: "%(system)s: %(instances)d up and %(down)d down - %(hosts)s",
    },
    config: {
      reset: {
        ask_confirmation      : 'Are you sure to reset all configuration?',
        confirmed             : 'All configuration has been reset.',
      },
      'email_current'         : 'Current email: %(email)s',
      'email_saved'           : 'Email: %(email)s',
      'email_undefined'       : 'Email: no email set yet.',
      'email_not-valid'       : '${red}Invalid email: (%(email)s). Please insert a valid email.${red.close}',
      'email_valid'           : '${green}email: %(email)s${green.close}',
      'email_reset-to-null'   : 'Email: there is no email set-up.',
      'set_ok'                : '`%(key)s` was set to `%(value)s`',
      'key_not_found'         : '`%(key)s` does not exist.',
      descriptions: {
        user: {
          email: 'User\'s email.',
          email_always_ask: 'Always ask for user’s email when an error occurs.',
          email_ask_count: 'How many times azk asked for user’s email.',
        },
        terms_of_use: {
          accepted: 'Indicates whether user has accepted terms of use or not.',
          ask_count: 'How many times azk asked about terms of use acceptance.',
        },
        crash_reports: {
          always_send: 'Always send crash reports when an error occurs (opt-out).',
        },
        tracker_permission: 'Always send tracking information (opt-out).',
      }
    },
    vm: {
      already_installed: "Virtual machine already installed.",
      not_installed    : "Virtual machine is not installed.",
      running          : "Virtual machine running.",
      already_running  : "Virtual machine already running.",
      not_running      : "Virtual machine is not running, try `azk vm start`.",
      error            : "vm error: %(error)s.",
      not_required     : "This system does not require a virtual machine, to try to force this behavior set `AZK_USE_VM=true`",
    },
    open: {
      success                       : "Opening ${blue}${underline}%(hostname)s${underline.close}${blue.close} in browser.",
      system_not_running            : "System " + "${red}%(name)s${red.close}" + " is not running to open.",
      system_not_balanceable        : "The system " + "${red}%(name)s${red.close}" + " does not have ports http to open.",
      default_system_not_balanceable: "The default system " + "${red}%(name)s${red.close}" + " does not have ports http to open.",
    },
    doctor: {
      deprecated: "Command `azk doctor` is deprecated, use `azk version --full` instead.",
    },
  },

  docker: {
    connect: "Connecting to Docker: %s...",
    monitor: {
      start : "${green}[docker:monitor]${green.close}" + " Monitoring Docker host (%(docker_host)s) with %(retry)s retries.",
      passed: "${green}[docker:monitor]${green.close}" + " Docker host (%s) is OK.",
      failed: "${red}[docker:monitor]${red.close}" + " Docker host (%s) has stopped! Stopping agent...",
    },
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
  },

  tracking: {
    timeout: "Analytics tracker timed out."
  }
};
// jscs:enable maximumLineLength
