#!/bin/bash

ROOT_UID=0

super() {
  if [[ $UID != $ROOT_UID ]]; then
    sudo "${@}"
  else
    $@
  fi
}

main(){

  echo "1. Checking platform"

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
  echo "==> Platform detected: $PLATFORM, $ARCH"

  if [[ $PLATFORM == "darwin" ]]; then
    OS="mac"
    OS_VERSION="osx"
    install_azk_mac_osx
    exit 0;
  fi

  if [[ $PLATFORM == "linux" ]]; then

    if [[ $ARCH != "x64" ]]; then
      echo "* ERROR: Unsupported architecture. Sorry, your Linux must be x64."
      exit 1;
    fi

    # Detecting OS and OS_VERSION
    source /etc/os-release
    OS=$ID
    OS_VERSION=$VERSION_ID

    echo "==> Linux detected: $OS, $OS_VERSION"

    # Check if linux distribution is compatible?
    if [[ $ID != "ubuntu" && $ID != "fedora" ]]; then
      echo "* ERROR: Unsupported version or Linux distribution detected"
      exit 1;
    fi

    # Check if is SUDO
    if [[ $UID != $ROOT_UID ]]; then
      super echo "sudo enabled"
    fi

    # Ubuntu 14.04
    if [[ $ID == "ubuntu" && $OS_VERSION == "14.04" ]]; then
      echo "deb [arch=amd64] http://repo.azukiapp.com trusty main" | super tee /etc/apt/sources.list.d/azuki.list
      install_azk_ubuntu
      add_user_to_docker_group
    fi

    # Ubuntu 12.04
    if [[ $ID == "ubuntu" && $OS_VERSION == "12.04" ]]; then
      echo "deb [arch=amd64] http://repo.azukiapp.com precise main" | super tee /etc/apt/sources.list.d/azuki.list
      install_azk_ubuntu
      add_user_to_docker_group
    fi

    # Fedora 20
    if [[ $ID == "fedora" && ( $OS_VERSION == "20" || $OS_VERSION == "21" ) ]]; then
      install_azk_fedora
      add_user_to_docker_group
    fi

    exit 0;
  fi
}

check_docker_installation() {
  echo "2. Checking Docker Installation"

  if hash docker 2>/dev/null; then
    echo '> docker is instaled, skipping docker installation.'
    if [[ $ID == "ubuntu" ]]; then
      echo '> to update docker, run command bellow:'
      echo '> $ curl -sSL https://get.docker.com/ubuntu/ | sudo sh'
    fi
  else
    echo '* ERROR: azk needs docker to be installed.'
    if [[ $ID == "ubuntu" ]]; then
      echo '*  to install docker run command bellow:'
      echo '*  $ curl -sSL https://get.docker.com/ubuntu/ | sudo sh'
    fi
    exit 1
  fi
}

add_user_to_docker_group() {
  echo "4. Adding current user to docker user group"

  super groupadd docker
  super gpasswd -a `whoami` docker
  super service docker restart
  echo "* Alert: Log out required"
  echo "*  non-sudo acess to docker client has been configured "
  echo "*  but you should log out and then log in again for these changes to take effect."
}

install_azk_ubuntu() {
  check_docker_installation

  echo "3. Installing azk"

  echo "apt-key adv --keyserver keys.gnupg.net --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9..."
  super apt-key adv --keyserver keys.gnupg.net --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9  1>/dev/null

  echo "apt-get update..."
  super apt-get update 1>/dev/null

  echo "apt-get install azk -y..."
  super apt-get install azk -y
}

install_azk_fedora() {
  check_docker_installation

  echo "3. Installing azk"

  super rpm --import 'http://repo.azukiapp.com/keys/azuki.asc'

  echo "[azuki]
name=azk
baseurl=http://repo.azukiapp.com/fedora20
enabled=1
gpgcheck=1
" | super tee /etc/yum.repos.d/azuki.repo

  super yum install azk -y
}

install_azk_mac_osx() {


  echo "2. Checking for VirtualBox installation"
  if hash VBoxManage 2>/dev/null; then
    echo "==> Virtual Box detected"
  else
    echo "* WARNING: Virtualbox not found"
    echo "*  In order to use azk you must have Virtualbox instaled on Mac OS X."
    echo "*  refer to: http://docs.azk.io/en/installation/mac_os_x.html"
  fi

  if hash brew 2>/dev/null; then
    echo "3. Installing azk"
    brew install azukiapp/azk/azk
  else
    echo "* ERROR: Homebrew not found"
    echo "*  In order to install azk you must have Homebrew on Mac OS X systems."
    echo "*  refer to: http://docs.azk.io/en/installation/mac_os_x.html"
    exit 1;
  fi
}

main
