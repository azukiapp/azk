
_azk()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -eq 1 ]; then
        COMPREPLY=( $( compgen -W '-h --help --version -h --help -h --help status stop agent version start vm help deploy restart docker shell open doctor config scale logs info init' -- $cur) )
    else
        case ${COMP_WORDS[1]} in
            status)
            _azk_status
        ;;
            stop)
            _azk_stop
        ;;
            agent)
            _azk_agent
        ;;
            version)
            _azk_version
        ;;
            start)
            _azk_start
        ;;
            vm)
            _azk_vm
        ;;
            help)
            _azk_help
        ;;
            deploy)
            _azk_deploy
        ;;
            restart)
            _azk_restart
        ;;
            docker)
            _azk_docker
        ;;
            shell)
            _azk_shell
        ;;
            open)
            _azk_open
        ;;
            doctor)
            _azk_doctor
        ;;
            config)
            _azk_config
        ;;
            scale)
            _azk_scale
        ;;
            logs)
            _azk_logs
        ;;
            info)
            _azk_info
        ;;
            init)
            _azk_init
        ;;
        esac

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

_azk_stop()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -fW '-r --no-remove -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
    fi
}

_azk_agent()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -eq 2 ]; then
        COMPREPLY=( $( compgen -W '--no-daemon --child --no-reload-vm --configure-file= -q --quiet -h --help -l= --log= -v --verbose status stop start' -- $cur) )
    else
        case ${COMP_WORDS[2]} in
            status)
            _azk_agent_status
        ;;
            stop)
            _azk_agent_stop
        ;;
            start)
            _azk_agent_start
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

_azk_agent_stop()
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

_azk_version()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_start()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -fW '-R --reprovision -B --rebuild -r --no-remove -o --open -a= --open-with= -q --quiet -h --help -l= --log= -v --verbose --git-ref= -R --reprovision -B --rebuild -r --no-remove -o --open -a= --open-with= -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
    fi
}

_azk_vm()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -eq 2 ]; then
        COMPREPLY=( $( compgen -fW '-F --force -q --quiet -h --help -l= --log= -v --verbose status stop start remove ssh -- installed' -- $cur) )
    else
        case ${COMP_WORDS[2]} in
            status)
            _azk_vm_status
        ;;
            stop)
            _azk_vm_stop
        ;;
            start)
            _azk_vm_start
        ;;
            remove)
            _azk_vm_remove
        ;;
            ssh)
            _azk_vm_ssh
        ;;
            --)
            _azk_vm_--
        ;;
            installed)
            _azk_vm_installed
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

_azk_vm_stop()
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

_azk_vm_remove()
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

_azk_vm_--()
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

_azk_help()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -fW ' ' -- $cur) )
    fi
}

_azk_deploy()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -eq 2 ]; then
        COMPREPLY=( $( compgen -W '-v --verbose -h --help -v --verbose -h --help full restart versions fast ssh rollback clear-cache shell' -- $cur) )
    else
        case ${COMP_WORDS[2]} in
            full)
            _azk_deploy_full
        ;;
            restart)
            _azk_deploy_restart
        ;;
            versions)
            _azk_deploy_versions
        ;;
            fast)
            _azk_deploy_fast
        ;;
            ssh)
            _azk_deploy_ssh
        ;;
            rollback)
            _azk_deploy_rollback
        ;;
            clear-cache)
            _azk_deploy_clear-cache
        ;;
            shell)
            _azk_deploy_shell
        ;;
        esac

    fi
}

_azk_deploy_full()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_deploy_restart()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_deploy_versions()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_deploy_fast()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_deploy_ssh()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -eq 3 ]; then
        COMPREPLY=( $( compgen -fW '-v --verbose -h --help --' -- $cur) )
    else
        case ${COMP_WORDS[3]} in
            --)
            _azk_deploy_ssh_--
        ;;
        esac

    fi
}

_azk_deploy_ssh_--()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 4 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_deploy_rollback()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -fW '-v --verbose -h --help ' -- $cur) )
    fi
}

_azk_deploy_clear-cache()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_deploy_shell()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -eq 3 ]; then
        COMPREPLY=( $( compgen -fW '-c= --command= -v --verbose -h --help --' -- $cur) )
    else
        case ${COMP_WORDS[3]} in
            --)
            _azk_deploy_shell_--
        ;;
        esac

    fi
}

_azk_deploy_shell_--()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 4 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_restart()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -fW '-R --reprovision -B --rebuild -r --no-remove -o --open -a= --open-with= -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
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

_azk_shell()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -eq 2 ]; then
        COMPREPLY=( $( compgen -fW '-c= --command= -C= --cwd= -i= --image= --shell= -B --rebuild -r --no-remove --silent -t --tty -T --no-tty -m= --mount= -e= --env= -q --quiet -h --help -l= --log= -v --verbose --' -- $cur) )
    else
        case ${COMP_WORDS[2]} in
            --)
            _azk_shell_--
        ;;
        esac

    fi
}

_azk_shell_--()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_open()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -fW '-a= --open-with= -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
    fi
}

_azk_doctor()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -W '--logo -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
    fi
}

_azk_config()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -eq 2 ]; then
        COMPREPLY=( $( compgen -W '-q --quiet -h --help -l= --log= -v --verbose track-toggle track-status' -- $cur) )
    else
        case ${COMP_WORDS[2]} in
            track-toggle)
            _azk_config_track-toggle
        ;;
            track-status)
            _azk_config_track-status
        ;;
        esac

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

_azk_config_track-status()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
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

_azk_info()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 2 ]; then
        COMPREPLY=( $( compgen -W '--no-colored -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
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

complete -F _azk azk