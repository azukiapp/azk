#!/bin/bash

ROOT_UID=0

main(){

  echo ""
  echo "**  --------------"
  echo "**  Installing azk"
  echo "**  --------------"
  echo ""

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
  echo "* Platform detected: $PLATFORM, $ARCH"

  if [[ $PLATFORM == "darwin" ]]; then
    OS="mac"
    OS_VERSION="osx"
    install_azk_mac_osx
    exit 0;
  fi

  if [[ $PLATFORM == "linux" ]]; then

    if [[ $ARCH != "x64" ]]; then
      echo "Unsupported architecture. Sorry, your Linux must be x64."
      exit 1;
    fi

    # Detecting OS and OS_VERSION
    source /etc/os-release
    OS=$ID
    OS_VERSION=$VERSION_ID

    echo "* Linux detected: $OS, $OS_VERSION"
    echo ""

    # Check if linux distribution is compatible?
    if [[ $ID != "ubuntu" && $ID != "fedora" ]]; then
      echo "Unsupported version or Linux distribution detected"
      exit 1;
    fi

    # Check if is SUDO
    if [[ $UID != $ROOT_UID ]]; then
      echo "Enabling sudo..."
      sudo bash "$0"
      exit 0;
    fi

    # Ubuntu 14.04
    if [[ $ID == "ubuntu" && $OS_VERSION == "14.04" ]]; then
      echo "deb [arch=amd64] http://repo.azukiapp.com trusty main" | sudo tee /etc/apt/sources.list.d/azuki.list
      install_azk_ubuntu
      add_user_to_docker_group
    fi

    # Ubuntu 12.04
    if [[ $ID == "ubuntu" && $OS_VERSION == "12.04" ]]; then
      echo "deb [arch=amd64] http://repo.azukiapp.com precise main" | sudo tee /etc/apt/sources.list.d/azuki.list
      install_azk_ubuntu
      add_user_to_docker_group
    fi

    # Fedora 20
    if [[ $ID == "fedora" && $OS_VERSION == "20" ]]; then
      install_azk_fedora_20
      add_user_to_docker_group
    fi

    exit 0;
  fi
}

check_docker_instalation() {
  echo ""
  echo "**  ------------------------"
  echo "**  check_docker_instalation"
  echo "**  ------------------------"
  echo ""

  if hash docker 2>/dev/null; then
    echo ''
    echo 'docker is instaled, skipping docker installation.'
    echo 'to update docker, run command bellow:'
    echo '$ curl -sSL https://get.docker.com/ubuntu/ | sudo sh'
    echo ''
  else
    echo ''
    echo 'azk needs docker installed.'
    echo 'to install docker run command bellow:'
    echo '$ curl -sSL https://get.docker.com/ubuntu/ | sudo sh'
    echo ''
    exit 1
  fi
}

add_user_to_docker_group() {
  echo ""
  echo "**  ------------------------"
  echo "**  add_user_to_docker_group"
  echo "**  ------------------------"
  echo ""

  groupadd docker
  gpasswd -a `whoami` docker
  service docker restart
  echo " ---------------------------------------------"
  echo " Alert: non-sudo acess to docker client has been configured but you should log out and then log in again for these changes to take effect."
  echo " ---------------------------------------------"
}

install_azk_ubuntu() {
  check_docker_instalation

  echo ""
  echo "**  ------------------"
  echo "**  install_azk_ubuntu"
  echo "**  ------------------"
  echo ""

  echo "sudo apt-key adv --keyserver keys.gnupg.net --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9..."
  sudo apt-key adv --keyserver keys.gnupg.net --recv-keys 022856F6D78159DF43B487D5C82CF0628592D2C9  1>/dev/null

  echo "sudo apt-get update..."
  sudo apt-get update 1>/dev/null

  echo ""
  echo "sudo apt-get install azk -y..."
  sudo apt-get install azk -y
}

install_azk_fedora_20() {
  check_docker_instalation

  echo ""
  echo "**  ---------------------"
  echo "**  install_azk_fedora_20"
  echo "**  ---------------------"
  echo ""

  rpm --import 'http://repo.azukiapp.com/keys/azuki.asc'

  echo "[azuki]
name=azk
baseurl=http://repo.azukiapp.com/fedora20
enabled=1
gpgcheck=1
" > /etc/yum.repos.d/azuki.repo

  sudo yum install azk -y
}

install_azk_mac_osx() {
  echo ""
  echo "**  -------------------"
  echo "**  install_azk_mac_osx"
  echo "**  -------------------"
  echo ""

  # check brew
  # check virtualbox
  brew install azukiapp/azk/azk
}

main
