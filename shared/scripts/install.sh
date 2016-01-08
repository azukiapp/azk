#!/bin/sh

ROOT_UID=0
ARRAY_SEPARATOR="#"

command_exists() {
  which "${@}" > /dev/null 2>&1
}

run_super() {
  if [ $(id -ru) != $ROOT_UID ]; then
    sudo "${@}"
  else
    "${@}"
  fi
}

super() {
  if [ "$1" = "-v" ]; then
    shift
    debug "${@}"
    run_super "${@}" > /dev/null
  elif echo "$1" | grep -P "\-v+"; then
    shift
    debug "${@}"
    run_super "${@}"
  else
    debug "${@}"
    run_super "${@}" > /dev/null 2>&1
  fi
}

atput() {
  [ -z "$TERM" ] && return 0
  eval "tput $@"
}

escape() {
  echo "$@" | sed "
    s/%{red}/$(atput setaf 1)/g;
    s/%{green}/$(atput setaf 2)/g;
    s/%{yellow}/$(atput setaf 3)/g;
    s/%{blue}/$(atput setaf 4)/g;
    s/%{magenta}/$(atput setaf 5)/g;
    s/%{cyan}/$(atput setaf 6)/g;
    s/%{white}/$(atput setaf 7)/g;
    s/%{reset}/$(atput sgr0)/g;
    s/%{[a-z]*}//g;
  "
}

log() {
  level="$1"; shift
  color=; stderr=; indentation=; tag=; opts=

  case "${level}" in
  debug)
    color="%{blue}"
    stderr=true
    indentation="  "
    ;;
  info)
    color="%{green}"
    ;;
  warn)
    color="%{yellow}"
    tag=" [WARN] "
    stderr=true
    ;;
  err)
    color="%{red}"
    tag=" [ERROR]"
  esac

  if [ "$1" = "-n" ]; then
    opts="-n"
    shift
  fi

  if [ "$1" = "-e" ]; then
    opts="$opts -e"
    shift
  fi

  if [ -z ${stderr} ]; then
    echo $opts "$(escape "${color}[azk]${tag}%{reset} ${indentation}$@")"
  else
    echo $opts "$(escape "${color}[azk]${tag}%{reset} ${indentation}$@")" 1>&2
  fi
}

step() {
  printf "$( log info -n $@ | sed -e :a -e 's/^.\{1,72\}$/&./;ta' )"
}

step_wait() {
  if [ ! -z "$@" ]; then
    STEP_WAIT="${@}"
    step "${STEP_WAIT}"
  fi
  echo "$(escape "%{blue}[ WAIT ]%{reset}")"
}

check_wait() {
  if [ ! -z "${STEP_WAIT}" ]; then
    step "${STEP_WAIT}"
    STEP_WAIT=
  fi
}

step_done() { check_wait && echo "$(escape "%{green}[ DONE ]%{reset}")"; }

step_fail() { check_wait && echo "$(escape "%{red}[ FAIL ]%{reset}")"; }

debug() { log debug $@; }

info() { log info $@; }

warn() { log warn $@; }

err() { log err $@; }

main(){

  if [ "$1" = "stage" ]; then
    AZUKIAPP_REPO_URL="http://repo-stage.azukiapp.com"
  else
    AZUKIAPP_REPO_URL="http://repo.azukiapp.com"
  fi

  step "Checking platform"

  # Detecting PLATFORM and ARCH
  UNAME="$(uname -a)"
  case "$UNAME" in
    Linux\ *)   PLATFORM=linux ;;
    Darwin\ *)  PLATFORM=darwin ;;
    SunOS\ *)   PLATFORM=sunos ;;
    FreeBSD\ *) PLATFORM=freebsd ;;
  esac
  case "$UNAME" in
    *x86_64*) ARCH=x64 ;;
    *i*86*)   ARCH=x86 ;;
    *armv6l*) ARCH=arm-pi ;;
  esac

  if [ -z $PLATFORM ] || [ -z $PLATFORM ]; then
    step_fail
    add_report "Cannot detect the current platform."
    fail
  fi

  step_done
  debug "Detected platform: $PLATFORM, $ARCH"

  if [ "$PLATFORM" = "darwin" ]; then
    OS="mac"
    OS_VERSION="osx"
    install_azk_mac_osx
    success
  fi

  if [ "$PLATFORM" = "linux" ]; then

    if [ "$ARCH" != "x64" ]; then
      add_report "Unsupported architecture. Linux must be x64."
      fail
    fi

    # Detecting OS and OS_VERSION
    . /etc/os-release
    OS=$ID
    OS_VERSION=$VERSION_ID

    debug "Detected distribution: $OS, $OS_VERSION"

    # Check if linux distribution is compatible?
    SUPPORTED_DISTROS=("ubuntu" "fedora" "arch")
    if ! echo ${SUPPORTED_DISTROS[@]} | grep -qw "$ID"; then
      add_report "  Unsupported Linux distribution."
      fail
    fi

    # Check if is SUDO
    if [ "$(id -ru)" != "$ROOT_UID" ]; then
      step_wait "Enabling sudo"
      super echo "sudo enabled"
      step_done
    fi

    if [ "$ID" = "ubuntu" ]; then
      case $OS_VERSION in
        "12.04" )
          UBUNTU_CODENAME="precise"
          ;;
        "14.04" )
          UBUNTU_CODENAME="trusty"
          ;;
        "15.10" )
          UBUNTU_CODENAME="wily"
          ;;
      esac

      if [ -z "${UBUNTU_CODENAME}" ]; then
        add_report "  Unsupported Ubuntu version."
        add_report "  Feel free to ask support for it by opening an issue at:"
        add_report "    https://github.com/azukiapp/azk/issues"
        fail
      else
        install_azk_ubuntu
        add_user_to_docker_group
        disable_dnsmasq
        success
      fi
    fi

    if [ "$ID" = "fedora" ]; then
      case $OS_VERSION in
        "20"|"21" )
          FEDORA_PKG_VERSION="20"
          FEDORA_PKG_MANAGER="yum"
          ;;
        "22" )
          FEDORA_PKG_VERSION="20"
          FEDORA_PKG_MANAGER="dnf"
          ;;
        "23" )
          FEDORA_PKG_VERSION="23"
          FEDORA_PKG_MANAGER="dnf"
          ;;
        * )
          add_report "  Unsupported Fedora version."
          add_report "  Feel free to ask support for it by opening an issue at:"
          add_report "    https://github.com/azukiapp/azk/issues"
          fail
      esac
      install_azk_fedora
      add_user_to_docker_group
      success
    fi

    if [ "$ID" = "arch" ]; then
      install_azk_arch
      add_user_to_docker_group
      success
    fi

    exit 0;
  fi
}

curl_or_wget() {
  CURL_BIN="curl"; WGET_BIN="wget"
  if command_exists ${CURL_BIN}; then
    echo "${CURL_BIN} -sSL"
  elif command_exists ${WGET_BIN}; then
    echo "${WGET_BIN} -nv -O- -t 2 -T 10"
  fi
}

abort_docker_installation() {
  add_report "azk needs Docker to be installed."
  add_report "  to install Docker run the command bellow:"
  add_report "  $ ${fetch_cmd} https://get.docker.com/ | sh"
  fail
}

install_docker_distro() {
  case "$ID" in
    ubuntu|fedora ) super bash -c "${fetch_cmd} https://get.docker.com/ | sh" ;;
    arch )          super pacman -S docker --noconfirm ;;
  esac
}

install_docker() {
  trap abort_docker_installation INT

  debug "Docker will be installed within 10 seconds."
  debug "To prevent its installation, just press CTRL+C now."
  sleep 10

  step_wait "Installing Docker"
  if install_docker_distro; then
    step_done
  else
    step_fail
    abort_docker_installation
  fi

  trap - INT
}

check_docker_installation() {
  step "Checking Docker installation"
  step_done

  fetch_cmd=$(curl_or_wget)
  if command_exists docker; then
    debug "Docker is installed, skipping Docker installation."
    debug "  To update Docker, run the command bellow:"
    debug "  $ ${fetch_cmd} https://get.docker.com/ | sh"
  else
    install_docker
  fi
}

install_azk_ubuntu() {
  check_docker_installation

  step_wait "Installing azk"

  if super apt-key adv --keyserver keys.gnupg.net --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9 && \
     echo "deb [arch=amd64] ${AZUKIAPP_REPO_URL} ${UBUNTU_CODENAME} main" | super tee /etc/apt/sources.list.d/azuki.list && \
     super -v apt-get update && \
     super -v apt-get install -y azk; then
    step_done
  else
    step_fail
    add_report 'Failed to install azk. Try again later.'
    fail
  fi
}

install_azk_fedora() {
  check_docker_installation

  step_wait "Installing azk"

  if super -v rpm --import "${AZUKIAPP_REPO_URL}/keys/azuki.asc" && \
     echo "[azuki]
name=azk
baseurl=${AZUKIAPP_REPO_URL}/fedora${FEDORA_PKG_VERSION}
enabled=1
gpgcheck=1
" | super tee /etc/yum.repos.d/azuki.repo && \
     super -v ${FEDORA_PKG_MANAGER} install -y azk; then
    step_done
  else
    step_fail
    add_report 'Failed to install azk. Try again later.'
    fail
  fi
}

abort_yaourt_installation() {
  add_report "azk needs yaourt to be installed."
  add_report "  to install yaourt run the command bellow:"
  add_report "  $ pacman -S yaourt"
  fail
}

install_yaourt() {
  trap abort_yaourt_installation INT

  debug "yaourt will be installed within 10 seconds."
  debug "To prevent its installation, just press CTRL+C now."
  sleep 10

  step_wait "Installing yaourt"
  if pacman -S yaourt --noconfirm; then
    step_done
  else
    step_fail
    abort_yaourt_installation
  fi

  trap - INT
}

install_azk_arch() {
  check_docker_installation

  step_wait "Installing azk"

  if ! command_exists yaourt; then
    install_yaourt
  fi

  if yaourt -S azk; then
    step_done
  else
    step_fail
    add_report 'Failed to install azk. Try again later.'
    fail
  fi
}

restart_docker_service() {
  case "$ID" in
    ubuntu|fedora ) super service docker restart ;;
    arch )          super systemctl restart docker.service ;;
  esac
}

add_user_to_docker_group() {
  if groups `whoami` | grep -q '\docker\b'; then
    return 0;
  fi

  step_wait "Adding current user to Docker user group"

  super groupadd docker
  super gpasswd -a `whoami` docker
  restart_docker_service

  step_done

  add_report "Log out required."
  add_report "  non-sudo access to Docker client has been configured,"
  add_report "  but you should log out and then log in again for these changes to take effect."
}

disable_dnsmasq() {
  step_wait "Disabling dnsmasq"

  super service dnsmasq stop
  super update-rc.d -f dnsmasq remove

  add_report "Note: dnsmasq service was disabled."
  step_done
}

install_azk_mac_osx() {
  step "Checking for VirtualBox installation"
  if command_exists VBoxManage; then
    step_done
    debug "Virtual Box detected"
  else
    step_fail
    add_report "Virtualbox not found"
    add_report "  In order to use azk you must have Virtualbox instaled on Mac OS X."
    add_report "  Refer to: http://docs.azk.io/en/installation/mac_os_x.html"
    fail
  fi


  step "Checking for Homebrew installation"
  if command_exists brew; then
    step_done
    debug "Homebrew detected"
  else
    step_fail
    add_report "Homebrew not found"
    add_report "  In order to install azk you must have Homebrew on Mac OS X systems."
    add_report "  Refer to: http://docs.azk.io/en/installation/mac_os_x.html"
    fail
  fi

  step_wait "Installing azk"
  if brew install azukiapp/azk/azk; then
    step_done
  else
    step_fail
  fi
}

add_report() {
  if [ -z "$report" ]; then
    report="${@}"
  else
    report="${report}${ARRAY_SEPARATOR}${@}"
  fi
}

fail() {
  echo ""
  IFS="${ARRAY_SEPARATOR}"
  add_report "Failed to install azk."
  for report_message in $report; do
    err "$report_message"
  done
  exit 1
}

success() {
  echo ""
  IFS="${ARRAY_SEPARATOR}"
  add_report "azk has been successfully installed."
  for report_message in $report; do
    info "$report_message"
  done
  exit 0
}

main "${@}"
