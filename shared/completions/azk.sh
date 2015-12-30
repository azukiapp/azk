
_azk()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -eq 1 ]; then
        COMPREPLY=( $( compgen -W '-h --help --version -h --help -h --help info status scale logs deploy open doctor stop vm agent start init shell version docker config restart help' -- $cur) )
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
            deploy)
            _azk_deploy
        ;;
            open)
            _azk_open
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

_azk_deploy()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -eq 2 ]; then
        COMPREPLY=( $( compgen -W '-v --verbose -h --help -v --verbose -h --help shell rollback clear-cache versions fast full ssh restart' -- $cur) )
    else
        case ${COMP_WORDS[2]} in
            shell)
            _azk_deploy_shell
        ;;
            rollback)
            _azk_deploy_rollback
        ;;
            clear-cache)
            _azk_deploy_clear-cache
        ;;
            versions)
            _azk_deploy_versions
        ;;
            fast)
            _azk_deploy_fast
        ;;
            full)
            _azk_deploy_full
        ;;
            ssh)
            _azk_deploy_ssh
        ;;
            restart)
            _azk_deploy_restart
        ;;
        esac

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

_azk_deploy_full()
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

_azk_deploy_restart()
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
        COMPREPLY=( $( compgen -W '--no-daemon --child --no-reload-vm --configure-file= -q --quiet -h --help -l= --log= -v --verbose status start stop' -- $cur) )
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
        COMPREPLY=( $( compgen -fW '-R --reprovision -B --rebuild -r --no-remove -o --open -a= --open-with= -q --quiet -h --help -l= --log= -v --verbose --git-ref= -R --reprovision -B --rebuild -r --no-remove -o --open -a= --open-with= -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
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
        COMPREPLY=( $( compgen -fW '--no-colored -q --quiet -h --help -l= --log= -v --verbose reset set list' -- $cur) )
    else
        case ${COMP_WORDS[2]} in
            reset)
            _azk_config_reset
        ;;
            set)
            _azk_config_set
        ;;
            list)
            _azk_config_list
        ;;
        esac

    fi
}

_azk_config_reset()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_config_set()
{
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"

    if [ $COMP_CWORD -ge 3 ]; then
        COMPREPLY=( $( compgen -W ' ' -- $cur) )
    fi
}

_azk_config_list()
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
        COMPREPLY=( $( compgen -fW '-R --reprovision -B --rebuild -r --no-remove -o --open -a= --open-with= -q --quiet -h --help -l= --log= -v --verbose ' -- $cur) )
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