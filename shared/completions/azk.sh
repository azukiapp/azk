
_azk()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -eq 1 ]; then
        COMPREPLY=( $( compgen -W '-h --help --version -h --help -h --help info status scale logs doctor stop vm agent start init shell version docker config restart help' -- $cur) )
    else
        case ${COMP_WORDS[1]} in
            info)
            _azk_info
        ;;
            status)
            _azk_status
        ;;
            scale)
            _azk_scale
        ;;
            logs)
            _azk_logs
        ;;
            doctor)
            _azk_doctor
        ;;
            stop)
            _azk_stop
        ;;
            vm)
            _azk_vm
        ;;
            agent)
            _azk_agent
        ;;
            start)
            _azk_start
        ;;
            init)
            _azk_init
        ;;
            shell)
            _azk_shell
        ;;
            version)
            _azk_version
        ;;
            docker)
            _azk_docker
        ;;
            config)
            _azk_config
        ;;
            restart)
            _azk_restart
        ;;
            help)
            _azk_help
        ;;
        esac

    fi
}

_azk_info()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -W '--no-colored -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
    fi
}

_azk_status()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -fW '--long --short --text -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
    fi
}

_azk_scale()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -fW '-r --no-remove -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
    fi
}

_azk_logs()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -fW '--no-timestamps -f --follow -n= --lines= -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
    fi
}

_azk_doctor()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -W '--logo -q --quiet -v --verbose ' -- $cur) )
    fi
}

_azk_stop()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -fW '-r --no-remove -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
    fi
}

_azk_vm()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -eq 2 ]; then
        COMPREPLY=( $( compgen -fW '-F --force -q --quiet -h --help -l= --log= -v --verbose status -- stop remove installed start ssh' -- $cur) )
    else
        case ${COMP_WORDS[2]} in
            status)
            _azk_vm_status
        ;;
            --)
            _azk_vm_--
        ;;
            stop)
            _azk_vm_stop
        ;;
            remove)
            _azk_vm_remove
        ;;
            installed)
            _azk_vm_installed
        ;;
            start)
            _azk_vm_start
        ;;
            ssh)
            _azk_vm_ssh
        ;;
        esac

    fi
}

_azk_vm_status()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_vm_--()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_vm_stop()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_vm_remove()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_vm_installed()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_vm_start()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_vm_ssh()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_agent()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -eq 2 ]; then
        COMPREPLY=( $( compgen -W '--no-daemon --child --no-reload-vm -q --quiet -h --help -l= --log= -v --verbose status start stop' -- $cur) )
    else
        case ${COMP_WORDS[2]} in
            status)
            _azk_agent_status
        ;;
            start)
            _azk_agent_start
        ;;
            stop)
            _azk_agent_stop
        ;;
        esac

    fi
}

_azk_agent_status()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_agent_start()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_agent_stop()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_start()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -fW '-R --reprovision -B --rebuild -o= --open= -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
    fi
}

_azk_init()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -fW '--filename -F --force -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
    fi
}

_azk_shell()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -fW '-c= --command= -C= --cwd= -i= --image= --shell= -r --no-remove --silent -T --tty -t --no-tty -q --quiet -h --help -l= --log= -m= --mount= -e= --env= -v --verbose ' -- $cur) )
    fi
}

_azk_version()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_docker()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -eq 2 ]; then
        COMPREPLY=( $( compgen -fW '-q --quiet -h --help -l= --log= -v --verbose --' -- $cur) )
    else
        case ${COMP_WORDS[2]} in
            --)
            _azk_docker_--
        ;;
        esac

    fi
}

_azk_docker_--()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_config()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -eq 2 ]; then
        COMPREPLY=( $( compgen -W '-q --quiet -h --help -l= --log= -v --verbose track-status track-toggle' -- $cur) )
    else
        case ${COMP_WORDS[2]} in
            track-status)
            _azk_config_track-status
        ;;
            track-toggle)
            _azk_config_track-toggle
        ;;
        esac

    fi
}

_azk_config_track-status()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_config_track-toggle()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_restart()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -fW '-R --reprovision -B --rebuild -o= --open= -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
    fi
}

_azk_help()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -fW ' ' -- $cur) )
    fi
}

complete -F _azk azk