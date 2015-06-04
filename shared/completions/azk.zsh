#compdef azk

_message_next_arg()
{
    argcount=0
    for word in "${words[@][2,-1]}"
    do
        if [[ $word != -* ]] ; then
            ((argcount++))
        fi
    done
    if [[ $argcount -le ${#myargs[@]} ]] ; then
        _message -r $myargs[$argcount]
        if [[ $myargs[$argcount] =~ ".*file.*" || $myargs[$argcount] =~ ".*path.*" ]] ; then
            _files
        fi
    fi
}

_azk ()
{
    local context state state_descr line
    typeset -A opt_args

    _arguments -C \
        ':command:->command' \
		'(-h)-h[Show help usage.]' \
		'(--help)--help[Show help usage.]' \
		'(--version)--version[Show azk version.]' \
		'(-h)-h[Show help usage.]' \
		'(--help)--help[Show help usage.]' \
		'(-h)-h[Show help usage.]' \
		'(--help)--help[Show help usage.]' \
        '*::options:->options'

    case $state in
        (command)
            local -a subcommands
            subcommands=(
				'info[Shows systems information for the current `Azkfile.js`]'
				'status[Shows azk agent status]'
				'scale[Scales (up or down) an instance of the system(s)]'
				'logs[Shows logs for the systems]'
				'doctor[Shows an analysis of `azk`'\''s health]'
				'stop[Stops azk agent running in the background]'
				'vm[Controls a virtual machine.]'
				'agent[Controls azk agent]'
				'start[Start azk agent]'
				'init[Initializes a project by adding the file Azkfile.js]'
				'shell[Initializes a shell with instance context, or runs a specified command]'
				'version[Shows azk version]'
				'docker[Alias for calling docker in '\''azk'\'' scope configuration]'
				'config[Controls azk configuration options]'
				'restart[Stops all systems and starts them again]'
				'help[Shows help about a specific command]'
            )
            _values 'azk' $subcommands
        ;;

        (options)
            case $line[1] in
                info)
                    _azk-info
                ;;
                status)
                    _azk-status
                ;;
                scale)
                    _azk-scale
                ;;
                logs)
                    _azk-logs
                ;;
                doctor)
                    _azk-doctor
                ;;
                stop)
                    _azk-stop
                ;;
                vm)
                    _azk-vm
                ;;
                agent)
                    _azk-agent
                ;;
                start)
                    _azk-start
                ;;
                init)
                    _azk-init
                ;;
                shell)
                    _azk-shell
                ;;
                version)
                    _azk-version
                ;;
                docker)
                    _azk-docker
                ;;
                config)
                    _azk-config
                ;;
                restart)
                    _azk-restart
                ;;
                help)
                    _azk-help
                ;;
            esac
        ;;
    esac

}

_azk-info ()
{
    local context state state_descr line
    typeset -A opt_args

    _arguments -C \
        ':command:->command' \
		'(--no-colored)--no-colored' \
		'(-q)-q' \
		'(--quiet)--quiet' \
		'(-h)-h' \
		'(--help)--help' \
		'(-l=-)-l=-' \
		'(--log=-)--log=-' \
		'(-v)-v' \
		'(--verbose)--verbose' \
        
}

_azk-status ()
{
    local context state state_descr line
    typeset -A opt_args

    if [[ $words[$CURRENT] == -* ]] ; then
        _arguments -C \
        ':command:->command' \
		'(--long)--long' \
		'(--short)--short' \
		'(--text)--text' \
		'(-q)-q' \
		'(--quiet)--quiet' \
		'(-h)-h' \
		'(--help)--help' \
		'(-l=-)-l=-' \
		'(--log=-)--log=-' \
		'(-v)-v' \
		'(--verbose)--verbose' \

    else
        myargs=('<system>')
        _message_next_arg
    fi
}

_azk-scale ()
{
    local context state state_descr line
    typeset -A opt_args

    if [[ $words[$CURRENT] == -* ]] ; then
        _arguments -C \
        ':command:->command' \
		'(-r)-r' \
		'(--no-remove)--no-remove' \
		'(-q)-q' \
		'(--quiet)--quiet' \
		'(-h)-h' \
		'(--help)--help' \
		'(-l=-)-l=-' \
		'(--log=-)--log=-' \
		'(-v)-v' \
		'(--verbose)--verbose' \

    else
        myargs=('<system>' '<to>')
        _message_next_arg
    fi
}

_azk-logs ()
{
    local context state state_descr line
    typeset -A opt_args

    if [[ $words[$CURRENT] == -* ]] ; then
        _arguments -C \
        ':command:->command' \
		'(--no-timestamps)--no-timestamps' \
		'(-f)-f' \
		'(--follow)--follow' \
		'(-n=-)-n=-' \
		'(--lines=-)--lines=-' \
		'(-q)-q' \
		'(--quiet)--quiet' \
		'(-h)-h' \
		'(--help)--help' \
		'(-l=-)-l=-' \
		'(--log=-)--log=-' \
		'(-v)-v' \
		'(--verbose)--verbose' \

    else
        myargs=('<system>' '<instances>')
        _message_next_arg
    fi
}

_azk-doctor ()
{
    local context state state_descr line
    typeset -A opt_args

    _arguments -C \
        ':command:->command' \
		'(--logo)--logo[Shows the `azk` logo before showing health information \[default: false\].]' \
		'(-q)-q[Never prompt \[default: false\].]' \
		'(--quiet)--quiet[Never prompt \[default: false\].]' \
		'(-v)-v[Sets the level of detail - multiple supported (-vv == --verbose 2) \[default: 0\].]' \
		'(--verbose)--verbose[Sets the level of detail - multiple supported (-vv == --verbose 2) \[default: 0\].]' \
        
}

_azk-stop ()
{
    local context state state_descr line
    typeset -A opt_args

    if [[ $words[$CURRENT] == -* ]] ; then
        _arguments -C \
        ':command:->command' \
		'(-r)-r' \
		'(--no-remove)--no-remove' \
		'(-q)-q' \
		'(--quiet)--quiet' \
		'(-h)-h' \
		'(--help)--help' \
		'(-l=-)-l=-' \
		'(--log=-)--log=-' \
		'(-v)-v' \
		'(--verbose)--verbose' \

    else
        myargs=('<system>')
        _message_next_arg
    fi
}

_azk-vm ()
{
    local context state state_descr line
    typeset -A opt_args

    if [[ $words[$CURRENT] == -* ]] ; then
        _arguments -C \
        ':command:->command' \
		'(-F)-F' \
		'(--force)--force' \
		'(-q)-q' \
		'(--quiet)--quiet' \
		'(-h)-h' \
		'(--help)--help' \
		'(-l=-)-l=-' \
		'(--log=-)--log=-' \
		'(-v)-v' \
		'(--verbose)--verbose' \

    else
        myargs=('<ssh-args>')
        _message_next_arg
    fi
}

_azk-agent ()
{
    local context state state_descr line
    typeset -A opt_args

    _arguments -C \
        ':command:->command' \
		'(--no-daemon)--no-daemon' \
		'(--child)--child' \
		'(--no-reload-vm)--no-reload-vm' \
		'(-q)-q' \
		'(--quiet)--quiet' \
		'(-h)-h' \
		'(--help)--help' \
		'(-l=-)-l=-' \
		'(--log=-)--log=-' \
		'(-v)-v' \
		'(--verbose)--verbose' \
        '*::options:->options'

    case $state in
        (command)
            local -a subcommands
            subcommands=(
				'status'
				'start'
				'stop'
            )
            _values 'azk agent' $subcommands
        ;;

        (options)
            case $line[1] in
                status)
                    _azk-agent-status
                ;;
                start)
                    _azk-agent-start
                ;;
                stop)
                    _azk-agent-stop
                ;;
            esac
        ;;
    esac

}

_azk-agent-status ()
{
    local context state state_descr line
    typeset -A opt_args

    _arguments -C \
        ':command:->command' \
        
}

_azk-agent-start ()
{
    local context state state_descr line
    typeset -A opt_args

    _arguments -C \
        ':command:->command' \
        
}

_azk-agent-stop ()
{
    local context state state_descr line
    typeset -A opt_args

    _arguments -C \
        ':command:->command' \
        
}

_azk-start ()
{
    local context state state_descr line
    typeset -A opt_args

    if [[ $words[$CURRENT] == -* ]] ; then
        _arguments -C \
        ':command:->command' \
		'(-R)-R' \
		'(--reprovision)--reprovision' \
		'(-B)-B' \
		'(--rebuild)--rebuild' \
		'(-o=-)-o=-' \
		'(--open=-)--open=-' \
		'(-q)-q' \
		'(--quiet)--quiet' \
		'(-h)-h' \
		'(--help)--help' \
		'(-l=-)-l=-' \
		'(--log=-)--log=-' \
		'(-v)-v' \
		'(--verbose)--verbose' \

    else
        myargs=('<system>')
        _message_next_arg
    fi
}

_azk-init ()
{
    local context state state_descr line
    typeset -A opt_args

    if [[ $words[$CURRENT] == -* ]] ; then
        _arguments -C \
        ':command:->command' \
		'(--filename)--filename' \
		'(-F)-F' \
		'(--force)--force' \
		'(-q)-q' \
		'(--quiet)--quiet' \
		'(-h)-h' \
		'(--help)--help' \
		'(-l=-)-l=-' \
		'(--log=-)--log=-' \
		'(-v)-v' \
		'(--verbose)--verbose' \

    else
        myargs=('<path>')
        _message_next_arg
    fi
}

_azk-shell ()
{
    local context state state_descr line
    typeset -A opt_args

    if [[ $words[$CURRENT] == -* ]] ; then
        _arguments -C \
        ':command:->command' \
		'(-c=-)-c=-' \
		'(--command=-)--command=-' \
		'(-C=-)-C=-' \
		'(--cwd=-)--cwd=-' \
		'(-i=-)-i=-' \
		'(--image=-)--image=-' \
		'(--shell=-)--shell=-' \
		'(-r)-r' \
		'(--no-remove)--no-remove' \
		'(--silent)--silent' \
		'(-T)-T' \
		'(--tty)--tty' \
		'(-t)-t' \
		'(--no-tty)--no-tty' \
		'(-q)-q' \
		'(--quiet)--quiet' \
		'(-h)-h' \
		'(--help)--help' \
		'(-l=-)-l=-' \
		'(--log=-)--log=-' \
		'(-m=-)-m=-' \
		'(--mount=-)--mount=-' \
		'(-e=-)-e=-' \
		'(--env=-)--env=-' \
		'(-v)-v' \
		'(--verbose)--verbose' \

    else
        myargs=('<system>')
        _message_next_arg
    fi
}

_azk-version ()
{
    local context state state_descr line
    typeset -A opt_args

    _arguments -C \
        ':command:->command' \
        
}

_azk-docker ()
{
    local context state state_descr line
    typeset -A opt_args

    if [[ $words[$CURRENT] == -* ]] ; then
        _arguments -C \
        ':command:->command' \
		'(-q)-q' \
		'(--quiet)--quiet' \
		'(-h)-h' \
		'(--help)--help' \
		'(-l=-)-l=-' \
		'(--log=-)--log=-' \
		'(-v)-v' \
		'(--verbose)--verbose' \

    else
        myargs=('<docker-args>')
        _message_next_arg
    fi
}

_azk-config ()
{
    local context state state_descr line
    typeset -A opt_args

    _arguments -C \
        ':command:->command' \
		'(-q)-q' \
		'(--quiet)--quiet' \
		'(-h)-h' \
		'(--help)--help' \
		'(-l=-)-l=-' \
		'(--log=-)--log=-' \
		'(-v)-v' \
		'(--verbose)--verbose' \
        '*::options:->options'

    case $state in
        (command)
            local -a subcommands
            subcommands=(
				'track-status'
				'track-toggle'
            )
            _values 'azk config' $subcommands
        ;;

        (options)
            case $line[1] in
                track-status)
                    _azk-config-track-status
                ;;
                track-toggle)
                    _azk-config-track-toggle
                ;;
            esac
        ;;
    esac

}

_azk-config-track-status ()
{
    local context state state_descr line
    typeset -A opt_args

    _arguments -C \
        ':command:->command' \
        
}

_azk-config-track-toggle ()
{
    local context state state_descr line
    typeset -A opt_args

    _arguments -C \
        ':command:->command' \
        
}

_azk-restart ()
{
    local context state state_descr line
    typeset -A opt_args

    if [[ $words[$CURRENT] == -* ]] ; then
        _arguments -C \
        ':command:->command' \
		'(-R)-R' \
		'(--reprovision)--reprovision' \
		'(-B)-B' \
		'(--rebuild)--rebuild' \
		'(-o=-)-o=-' \
		'(--open=-)--open=-' \
		'(-q)-q' \
		'(--quiet)--quiet' \
		'(-h)-h' \
		'(--help)--help' \
		'(-l=-)-l=-' \
		'(--log=-)--log=-' \
		'(-v)-v' \
		'(--verbose)--verbose' \

    else
        myargs=('<system>')
        _message_next_arg
    fi
}

_azk-help ()
{
    local context state state_descr line
    typeset -A opt_args

    if [[ $words[$CURRENT] == -* ]] ; then
        _arguments -C \
        ':command:->command' \

    else
        myargs=('<command>')
        _message_next_arg
    fi
}


_azk "$@"