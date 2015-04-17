#!/bin/bash

ROOT_UID=0
NEWLINE=$'\n'

super() {
  debug "${@}"
  if [[ $UID != $ROOT_UID ]]; then
    sudo "${@}"
  else
    $@
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
  local level="$1"; shift
  case "${level}" in
  debug)
    local color="%{blue}"
    local stderr=true
    ;;
  info)
    local color="%{green}"
    ;;
  warn)
    local color="%{yellow}"
    local tag=" [WARN] "
    stderr=true
    ;;
  err)
    local color="%{red}"
    local tag=" [ERROR]"
  esac

  if [[ $1 == "-n" ]]; then
    local opts="-n"
    shift
  fi

  if [[ $1 == "-e" ]]; then
    local opts="$opts -e"
    shift
  fi

  if [[ -z ${stderr} ]]; then
    echo $opts "$(escape "${color}[azk]${tag}%{reset} $@")"
  else
    echo $opts "$(escape "${color}[azk]${tag}%{reset} $@")" 1>&2
  fi
}

step() { log info -n $@ | sed -e :a -e 's/^.\{1,72\}$/&./;ta'; }

step_done() { echo "[ DONE ]"; }

step_fail() { echo "[ FAIL ]"; }

debug() { log debug $@; }

info() { log info $@; }

warn() { log warn $@; }

err() { log err $@; }

main(){

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

  if [[ -z $PLATFORM ]] || [[ -z $PLATFORM ]]; then
    step_fail
    add_report "Cannot detect the current platform."
    fail
  fi

  step_done
  debug "  Detected platform: $PLATFORM, $ARCH"

  if [[ $PLATFORM == "darwin" ]]; then
    OS="mac"
    OS_VERSION="osx"
    install_azk_mac_osx
    success
  fi

  if [[ $PLATFORM == "linux" ]]; then

    if [[ $ARCH != "x64" ]]; then
      add_report "Unsupported architecture. Linux must be x64."
      fail
    fi

    # Detecting OS and OS_VERSION
    source /etc/os-release
    OS=$ID
    OS_VERSION=$VERSION_ID

    debug "  Detected Linux: $OS, $OS_VERSION"

    # Check if linux distribution is compatible?
    if [[ $ID != "ubuntu" && $ID != "fedora" ]]; then
      add_report "  Unsupported Linux distribution."
      fail
    fi

    # Check if is SUDO
    if [[ $UID != $ROOT_UID ]]; then
      super echo "sudo enabled" > /dev/null
    fi

    # Ubuntu 14.04
    if [[ $ID == "ubuntu" && $OS_VERSION == "14.04" ]]; then
      echo "deb [arch=amd64] http://repo.azukiapp.com trusty main" | super tee /etc/apt/sources.list.d/azuki.list 1>/dev/null 2>&1
      install_azk_ubuntu
      add_user_to_docker_group
      disable_dnsmasq
      success
    fi

    # Ubuntu 12.04
    if [[ $ID == "ubuntu" && $OS_VERSION == "12.04" ]]; then
      echo "deb [arch=amd64] http://repo.azukiapp.com precise main" | super tee /etc/apt/sources.list.d/azuki.list 1>/dev/null 2>&1
      install_azk_ubuntu
      add_user_to_docker_group
      disable_dnsmasq
      success
    fi

    # Fedora 20
    if [[ $ID == "fedora" && ( $OS_VERSION == "20" || $OS_VERSION == "21" ) ]]; then
      install_azk_fedora
      add_user_to_docker_group
      success
    fi

    exit 0;
  fi
}

check_docker_installation() {
  step "Checking Docker installation"

  if hash docker 2>/dev/null; then
    step_done
    debug '  Docker is instaled, skipping docker installation.'
    if [[ $ID == "ubuntu" ]]; then
      debug '    To update docker, run command bellow:'
      debug '    $ curl -sSL https://get.docker.com/ubuntu/ | sudo sh'
    fi
  else
    step_fail
    add_report 'azk needs docker to be installed.'
    if [[ $ID == "ubuntu" ]]; then
      add_report '  to install docker run command bellow:'
      add_report '  $ curl -sSL https://get.docker.com/ubuntu/ | sudo sh'
    fi
    fail
  fi
}

install_azk_ubuntu() {
  check_docker_installation

  step "Installing azk"

  echo "" 1>&2
  super apt-key adv --keyserver keys.gnupg.net --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9 1>/dev/null 2>&1
  super apt-get update 1>/dev/null
  super apt-get install azk -y 1>/dev/null

  step_done
}

install_azk_fedora() {
  check_docker_installation

  step "Installing azk"

  echo "" 1>&2
  super rpm --import 'http://repo.azukiapp.com/keys/azuki.asc' 1>/dev/null

  echo "[azuki]
name=azk
baseurl=http://repo.azukiapp.com/fedora20
enabled=1
gpgcheck=1
" | super tee /etc/yum.repos.d/azuki.repo 1>/dev/null 2>&1

  super yum install azk -y 1>/dev/null

  step_done
}

add_user_to_docker_group() {
  if groups `whoami` | grep &>/dev/null '\docker\b'; then
    return 0;
  fi

  step "Adding current user to docker user group"

  echo "" 1>&2
  super groupadd docker 1>/dev/null
  super gpasswd -a `whoami` docker 1>/dev/null
  super service docker restart 1>/dev/null

  step_done

  add_report "Log out required."
  add_report "  non-sudo access to docker client has been configured,"
  add_report "  but you should log out and then log in again for these changes to take effect."
}

disable_dnsmasq() {
  step "Disabling dnsmasq"

  super service dnsmasq stop 1>/dev/null 2>&1
  super update-rc.d -f dnsmasq remove 1>/dev/null 2>&1

  add_report "Note: dnsmasq service was disabled."
  step_done
}

install_azk_mac_osx() {
  step "Checking for VirtualBox installation"
  if hash VBoxManage 2>/dev/null; then
    step_done
    debug "Virtual Box detected"
  else
    step_fail
    add_report "Virtualbox not found"
    add_report "  In order to use azk you must have Virtualbox instaled on Mac OS X."
    add_report "  Refer to: http://docs.azk.io/en/installation/mac_os_x.html"
    fail
  fi

  if hash brew 2>/dev/null; then
    step_done
    step "Installing azk"
    brew install azukiapp/azk/azk
    step_done
  else
    step_fail
    add_report "Homebrew not found"
    add_report "  In order to install azk you must have Homebrew on Mac OS X systems."
    add_report "  Refer to: http://docs.azk.io/en/installation/mac_os_x.html"
    fail
  fi
}

add_report() {
  if [[ -z $report ]]; then
    report=()
  fi
  report+=("${@}")
}

fail() {
  echo ""
  IFS=$NEWLINE
  add_report "Failed to install azk."
  for report_message in ${report[@]}; do
    err "$report_message"
  done
  exit 1
}

success() {
  echo ""
  IFS=$NEWLINE
  add_report "azk has been successfully installed."
  for report_message in ${report[@]}; do
    info "$report_message"
  done
  exit 0
}

main
