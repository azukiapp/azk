#!/bin/sh

{ # This ensures the entire script is downloaded

ROOT_UID=0
ARRAY_SEPARATOR="#"

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
    SUPPORTED_DISTROS="ubuntu fedora arch"
    if ! echo ${SUPPORTED_DISTROS} | grep -qw "$ID"; then
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

# Linux installation

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

install_docker_distro() {
  case "$ID" in
    ubuntu|fedora ) super bash -c "${fetch_cmd} https://get.docker.com/ | sh" ;;
    arch )          super pacman -Sy docker --noconfirm ;;
  esac
}

abort_docker_installation() {
  add_report "azk needs Docker to be installed."
  add_report "  to install Docker run the command bellow:"
  add_report "  $ ${fetch_cmd} https://get.docker.com/ | sh"
  fail
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

install_azk_ubuntu() {
  check_azk_installation
  check_docker_installation

  step_wait "${INSTALL_STEP_LABEL}"

  if super apt-key adv --keyserver keys.gnupg.net --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9 && \
     echo "deb [arch=amd64] ${AZUKIAPP_REPO_URL} ${UBUNTU_CODENAME} main" | super tee /etc/apt/sources.list.d/azuki.list && \
     super -v apt-get update && \
     super -v apt-get install -y azk; then
    step_done
  else
    step_fail
    add_report "${FAIL_TO_INSTALL_MSG}"
    fail
  fi
}

disable_dnsmasq() {
  step_wait "Disabling dnsmasq"

  super service dnsmasq stop
  super update-rc.d -f dnsmasq remove

  add_report "Note: dnsmasq service was disabled."
  step_done
}

install_azk_fedora() {
  check_azk_installation
  check_docker_installation

  step_wait "${INSTALL_STEP_LABEL}"

  if [ "${UPDATE_AZK}" = "true" ]; then
    FEDORA_PKG_MANAGER_ACTION="upgrade"
  else
    FEDORA_PKG_MANAGER_ACTION="install"
  fi

  if super -v rpm --import "${AZUKIAPP_REPO_URL}/keys/azuki.asc" && \
     echo "[azuki]
name=azk
baseurl=${AZUKIAPP_REPO_URL}/fedora${FEDORA_PKG_VERSION}
enabled=1
gpgcheck=1
" | super tee /etc/yum.repos.d/azuki.repo && \
    super -v ${FEDORA_PKG_MANAGER} ${FEDORA_PKG_MANAGER_ACTION} -y azk; then
    step_done
  else
    step_fail
    add_report "${FAIL_TO_INSTALL_MSG}"
    fail
  fi
}

install_azk_arch() {
  check_azk_installation
  check_docker_installation

  step_wait "${INSTALL_STEP_LABEL}"

  if ! command_exists yaourt; then
    install_yaourt
  fi

  if yaourt -S azk --noconfirm; then
    step_done
  else
    step_fail
    add_report "${FAIL_TO_INSTALL_MSG}"
    fail
  fi
}

install_yaourt() {
  trap abort_yaourt_installation INT

  debug "yaourt will be installed within 10 seconds."
  debug "To prevent its installation, just press CTRL+C now."
  sleep 10

  step_wait "Installing yaourt"

  if ! grep -q '\[archlinuxfr\]' /etc/pacman.conf; then
    echo "[archlinuxfr]
SigLevel = Never
Server = http://repo.archlinux.fr/\$arch" | \
    super tee -a /etc/pacman.conf
  fi

  if super pacman -Sy yaourt --noconfirm; then
    step_done
  else
    step_fail
    abort_yaourt_installation
  fi

  trap - INT
}

abort_yaourt_installation() {
  add_report "azk needs yaourt to be installed."
  add_report "  to install yaourt run the command bellow:"
  add_report "  $ sudo pacman -Sy yaourt"
  fail
}

# Mac OS X installation

install_azk_mac_osx() {
  check_azk_installation
  check_vbox_installation
  check_homebrew_installation

  step_wait "${INSTALL_STEP_LABEL}"
  if [ "${UPDATE_AZK}" = "true" ]  && \
     brew untap azukiapp/azk && brew tap azukiapp/azk && brew upgrade azukiapp/azk/azk || \
     [ "${UPDATE_AZK}" != "true" ] && \
     brew install azukiapp/azk/azk; then
    step_done
  else
    step_fail
    add_report "${FAIL_TO_INSTALL_MSG}"
    fail
  fi
}

check_vbox_installation() {
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
}

check_homebrew_installation() {
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
}

# Misc helpers

curl_or_wget() {
  CURL_BIN="curl"; WGET_BIN="wget"
  if command_exists ${CURL_BIN}; then
    echo "${CURL_BIN} -sSL"
  elif command_exists ${WGET_BIN}; then
    echo "${WGET_BIN} -nv -O- -t 2 -T 10"
  fi
}

stop_agent() {
  if ! azk agent status > /dev/null 2>&1; then
    return 0
  fi

  trap abort_agent_stop INT

  debug "azk agent will be stopped within 10 seconds."
  debug "To prevent it, just press CTRL+C now."
  sleep 10

  step_wait "Stopping azk agent"
  if azk agent stop; then
    step_done
  else
    step_fail
    abort_agent_stop
  fi

  trap - INT
}

abort_agent_stop() {
  add_report "azk needs agent to be stopped."
  add_report "  to stop it run the command bellow:"
  add_report "  $ azk agent stop"
  fail
}

check_azk_installation() {
  if command_exists azk; then
    if azk_is_up_to_date; then
      echo
      info "  azk is already in the latest version (v${AZK_CURRENT_VERSION})."
      exit 0
    else
      stop_agent
      UPDATE_AZK="true"
      INSTALL_STEP_LABEL="Updating azk"
      FAIL_TO_INSTALL_MSG="Failed to update azk. Try again later."
    fi
  else
    INSTALL_STEP_LABEL="Installing azk"
    FAIL_TO_INSTALL_MSG="Failed to install azk. Try again later."
  fi
}

azk_is_up_to_date() {
  AZK_TAGS_URL="https://api.github.com/repos/azukiapp/azk/tags"
  AZK_VERSIONS=$(curl -sSL ${AZK_TAGS_URL} | grep name)
  AZK_CURRENT_VERSION=$(azk version | sed -e 's/^azk version\ //; s/,.*//')
  AZK_LATEST_VERSION=$( curl -sSL ${AZK_TAGS_URL} | \
                        grep name | \
                        head -1 | \
                        sed 's/[^0-9.]*"v\([0-9.]*\).*",/\1/' )
  [ "${AZK_CURRENT_VERSION}" = "${AZK_LATEST_VERSION}" ]
}

command_exists() {
  command -v "${@}" > /dev/null 2>&1
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
  printf "$( log info $@ | sed -e :a -e 's/^.\{1,72\}$/&./;ta' )"
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
  if [ "${UPDATE_AZK}" = "true" ]; then
    add_report "azk has been successfully updated."
    add_report 'Restart `azk agent` in order for changes to take effect.'
  else
    add_report "azk has been successfully installed."
  fi
  for report_message in $report; do
    info "$report_message"
  done
  exit 0
}

main "${@}"

} # This ensures the entire script is downloaded
